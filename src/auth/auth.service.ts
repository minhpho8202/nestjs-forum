import { BadRequestException, ConflictException, ForbiddenException, HttpException, HttpStatus, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RegisterDTO } from './dto/register.dto';
import { LoginDTO } from './dto/login.dto';

@Injectable()
export class AuthService {
    constructor(private prismaService: PrismaService,
        private jwtService: JwtService,
        private configService: ConfigService,
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
                }
            });

            if (!user) {
                throw new NotFoundException("User not found");
            }

            const checkPasword = await argon.verify(user?.password, loginDTO.password);

            if (!checkPasword) {
                throw new BadRequestException('Invalid username or password');
            }

            const payload = { id: user.id, email: user.email, role: user.role };

            return await this.generateToken(payload);
        } catch (error) {
            throw error;
        }
    }

    async generateToken(payload: { id: number, email: string, role: string }) {
        try {
            const accessToken = await this.jwtService.signAsync(payload,
                {
                    secret: this.configService.get('ACCESS_TOKEN_SECRET'),
                    expiresIn: '99d',
                });
            const refreshToken = await this.jwtService.signAsync({
                id: payload.id,
                email: payload.email,
                role: payload.role
            },
                {
                    secret: this.configService.get('REFRESH_TOKEN_SECRET'),
                    expiresIn: '7d',
                },);

            await this.prismaService.user.update({
                where: { email: payload.email },
                data: { refreshToken: refreshToken },
            });

            return { accessToken, refreshToken };
        } catch (error) {
            throw error;
        }
    }

    async refreshToken(refreshToken: string) {
        try {
            const verify = await this.jwtService.verifyAsync(refreshToken, {
                secret: this.configService.get('REFRESH_TOKEN_SECRET')
            })
            const checkExistToken = await this.prismaService.user.findUnique(
                {
                    where: {
                        email: verify.email, refreshToken
                    }
                }
            )
            if (checkExistToken) {
                return this.generateToken({ id: verify.id, email: verify.email, role: verify.role });
            } else {
                throw new UnauthorizedException('Refresh token is not valid');
            }

        } catch (error) {
            throw error;
        }
    }
}
