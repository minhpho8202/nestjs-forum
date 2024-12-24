import { BadRequestException, ConflictException, ForbiddenException, HttpException, HttpStatus, Inject, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as argon from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RegisterDTO } from './dto/register.dto';
import { LoginDTO } from './dto/login.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class AuthService {
    constructor(private prismaService: PrismaService,
        private jwtService: JwtService,
        private configService: ConfigService,
        @Inject(CACHE_MANAGER) private cacheManager: Cache
    ) { }
    async register(registerDTO: RegisterDTO) {
        try {
            const existingUserEmail = await this.prismaService.user.findFirst({ where: { email: registerDTO.email } });
            const existingUserUsername = await this.prismaService.user.findFirst({ where: { username: registerDTO.username } });

            const hash = await argon.hash(registerDTO.password);

            if (!existingUserEmail && !existingUserUsername) {
                const user = await this.prismaService.user.create({
                    data: {
                        username: registerDTO.username,
                        password: hash,
                        email: registerDTO.email,
                    },
                    select: {
                        id: true,
                        username: true,
                        email: true,
                        profilePicture: true,
                        bio: true,
                        role: true,
                    },
                });

                return user;
            }

            if (existingUserEmail && existingUserEmail.username) {
                throw new ConflictException('Email already exists');
            }


            if (existingUserUsername) {
                throw new ConflictException('Username already exists');
            }

            const user = await this.prismaService.user.update({
                where: { email: registerDTO.email },
                data: {
                    username: registerDTO.username,
                    password: hash,
                },
                select: {
                    id: true,
                    username: true,
                    email: true,
                    profilePicture: true,
                    bio: true,
                    role: true,
                },
            });

            return user;


        } catch (error) {
            throw error;
        }
    }

    async login(loginDTO: LoginDTO) {
        try {
            const user = await this.prismaService.user.findUnique({
                where: {
                    username: loginDTO.username,
                    isActived: true,
                    isDeleted: false,
                },
                select: {
                    id: true,
                    username: true,
                    password: true,
                    email: true,
                    profilePicture: true,
                    bio: true,
                    role: true,
                }
            });

            if (!user) {
                throw new NotFoundException("User not found");
            }

            const checkPasword = await argon.verify(user?.password, loginDTO.password);

            if (!checkPasword) {
                throw new BadRequestException('Invalid username or password');
            }

            delete user.password;

            const tokens = await this.generateToken(user);

            return {
                user,
                tokens
            }
        } catch (error) {
            throw error;
        }
    }

    async generateToken(user: any) {
        try {
            const payload = { id: user.id, email: user.email, role: user.role };

            const accessToken = await this.jwtService.signAsync(payload,
                {
                    secret: this.configService.get('ACCESS_TOKEN_SECRET'),
                    expiresIn: this.configService.get('ACCESS_TOKEN_EXPIRES_IN'),
                });

            const refreshToken = await this.jwtService.signAsync({
                id: payload.id,
                email: payload.email,
                role: payload.role
            },
                {
                    secret: this.configService.get('REFRESH_TOKEN_SECRET'),
                    expiresIn: this.configService.get('REFRESH_TOKEN_EXPIRES_IN'),
                },);

            const key = `user_${user.id}`;
            const value = { ...user, refreshToken: refreshToken };
            await this.cacheManager.set(key, value, this.configService.get('REFRESH_TOKEN_EXPIRES_IN_CACHE'));

            return {
                accessToken,
                accessTokenExpiresIn: parseInt(this.configService.get('ACCESS_TOKEN_EXPIRES_IN'), 10),
                refreshToken,
                refreshTokenExpiresIn: parseInt(this.configService.get('REFRESH_TOKEN_EXPIRES_IN'), 10)
            };
        } catch (error) {
            throw error;
        }
    }

    async refreshToken(refreshToken: string) {
        try {
            const verify = await this.jwtService.verifyAsync(refreshToken, {
                secret: this.configService.get('REFRESH_TOKEN_SECRET')
            })

            const key = `user_${verify.id}`;

            const checkExistToken: any = await this.cacheManager.get(key);
            if (!checkExistToken) {
                throw new UnauthorizedException('Refresh token is not valid');
            }
            if (checkExistToken.refreshToken === refreshToken) {
                return this.generateToken(checkExistToken);
            } else {
                throw new UnauthorizedException('Refresh token is not valid');
            }

        } catch (error) {
            throw error;
        }
    }
}
