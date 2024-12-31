import { BadRequestException, ConflictException, ForbiddenException, HttpException, HttpStatus, Inject, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as argon from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RegisterDTO } from './dto/register.dto';
import { LoginDTO } from './dto/login.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { MailerService } from '@nestjs-modules/mailer';
import { ResetPasswordDTO } from './dto/reset-password.dto';

@Injectable()
export class AuthService {
    constructor(private prismaService: PrismaService,
        private jwtService: JwtService,
        private configService: ConfigService,
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
        private mailerService: MailerService,
    ) { }
    // async register(registerDTO: RegisterDTO) {
    //     try {
    //         if (registerDTO.password !== registerDTO.confirmPassword) {
    //             throw new BadRequestException('Password and confirm password do not match.');
    //         }

    //         const existingUserEmail = await this.prismaService.user.findFirst({ where: { email: registerDTO.email } });
    //         const existingUserUsername = await this.prismaService.user.findFirst({ where: { username: registerDTO.username } });

    //         const hash = await argon.hash(registerDTO.password);

    //         if (!existingUserEmail && !existingUserUsername) {
    //             const user = await this.prismaService.user.create({
    //                 data: {
    //                     username: registerDTO.username,
    //                     password: hash,
    //                     email: registerDTO.email,
    //                 },
    //                 select: {
    //                     id: true,
    //                     username: true,
    //                     email: true,
    //                     profilePicture: true,
    //                     bio: true,
    //                     role: true,
    //                 },
    //             });

    //             return user;
    //         }

    //         if (existingUserEmail && existingUserEmail.username) {
    //             throw new ConflictException('Email already exists');
    //         }


    //         if (existingUserUsername) {
    //             throw new ConflictException('Username already exists');
    //         }

    //         const user = await this.prismaService.user.update({
    //             where: { email: registerDTO.email },
    //             data: {
    //                 username: registerDTO.username,
    //                 password: hash,
    //             },
    //             select: {
    //                 id: true,
    //                 username: true,
    //                 email: true,
    //                 profilePicture: true,
    //                 bio: true,
    //                 role: true,
    //             },
    //         });

    //         return user;


    //     } catch (error) {
    //         throw error;
    //     }
    // }

    async register(registerDTO: RegisterDTO) {
        try {
            if (registerDTO.password !== registerDTO.confirmPassword) {
                throw new BadRequestException('Password and confirm password do not match.');
            }

            const existingUserEmail = await this.prismaService.user.findFirst({ where: { email: registerDTO.email } });
            const existingUserUsername = await this.prismaService.user.findFirst({ where: { username: registerDTO.username } });

            if (existingUserUsername) {
                throw new ConflictException('Username already exists');
            }

            if (existingUserEmail && existingUserEmail.username) {
                throw new ConflictException('Email already exists');
            }

            const hashedPassword = await argon.hash(registerDTO.password);

            const payload = { email: registerDTO.email, username: registerDTO.username, password: hashedPassword };

            const token = await this.jwtService.signAsync(payload,
                {
                    secret: this.configService.get('REGISTER_TOKEN_SECRET'),
                    expiresIn: this.configService.get('REGISTER_TOKEN_EXPIRES_IN'),
                },);

            // const key = `register_${token}`;

            // await this.cacheManager.set(key, payload, this.configService.get('REGISTER_TOKEN_EXPIRES_IN_CACHE'));

            const confirmationUrl = `${this.configService.get('URL')}auth/confirm?token=${token}`;
            await this.mailerService.sendMail({
                to: registerDTO.email,
                subject: 'Confirm Your Email',
                html: `<p style="font-size: 16px; line-height: 1.5; color: #333;">
                        Click <a href="${confirmationUrl}" style="color: #007bff; text-decoration: none; font-weight: bold;">here</a> to confirm your email.
                        </p>`,
            });

            return { message: 'Registration successful. Please check your email for confirmation.' };
        } catch (error) {
            throw error;
        }
    }

    async confirmEmail(token: string) {
        try {
            // const key = `register_${token}`;

            // const cachedData = await this.cacheManager.get(key);

            // if (!cachedData) {
            //     throw new BadRequestException('Invalid or expired token');
            // }

            const payload = await this.jwtService.verifyAsync(token, {
                secret: this.configService.get('REGISTER_TOKEN_SECRET')
            })

            const user = await this.prismaService.user.findFirst({ where: { email: payload.email } });

            if (!user) {
                await this.prismaService.user.create({
                    data: {
                        username: payload.username,
                        password: payload.password,
                        email: payload.email
                    },
                });
            } else {
                await this.prismaService.user.update({
                    where: {
                        email: payload.email
                    },
                    data: {
                        username: payload.username,
                        password: payload.password,
                    },
                });
            }


            // await this.cacheManager.del(key);

            return { message: 'Email confirmed and account created successfully.' };
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                throw new UnauthorizedException('Token has expired');
            }
            throw new UnauthorizedException('Token is not valid');
        }
    }

    async forgetPassword(email: string) {
        try {
            const user = await this.prismaService.user.findFirst({ where: { email } });
            if (!user) {
                throw new NotFoundException("User not found");
            }

            const token = await this.jwtService.signAsync({ id: user.id, email },
                {
                    secret: this.configService.get('REGISTER_TOKEN_SECRET'),
                    expiresIn: this.configService.get('REGISTER_TOKEN_EXPIRES_IN'),
                },);

            const resetLink = `${this.configService.get('FE_URL')}reset-password?token=${token}`;

            await this.mailerService.sendMail({
                to: email,
                subject: 'Reset Your Password',
                html: `<p style="font-size: 16px; line-height: 1.5; color: #333;">
                        Click <a href="${resetLink}" style="color: #007bff; text-decoration: none; font-weight: bold;">here</a> to reset your password.
                        </p>`,
            });

            return { message: 'Reset password email sent successfully' };
        } catch (error) {
            throw error;
        }
    }

    async resetPassword(resetPasswordDTO: ResetPasswordDTO) {
        try {
            if (resetPasswordDTO.newPassword !== resetPasswordDTO.confirmPassword) {
                throw new BadRequestException('Password and confirm password do not match.');
            }

            const payload = await this.jwtService.verifyAsync(resetPasswordDTO.token, {
                secret: this.configService.get('REGISTER_TOKEN_SECRET')
            })

            const user = await this.prismaService.user.findFirst({ where: { id: payload.id } });

            if (!user) {
                throw new NotFoundException("User not found");
            }

            const hashedPassword = await argon.hash(resetPasswordDTO.newPassword);

            await this.prismaService.user.update(
                {
                    where: { id: payload.id },
                    data: { password: hashedPassword }
                }
            );

            return { message: 'Password reset successfully' };
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                throw new UnauthorizedException('Token has expired');
            }
            throw new UnauthorizedException('Token is not valid');
        }
    }

    async login(loginDTO: LoginDTO) {
        try {
            const user = await this.prismaService.user.findFirst({
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
            if (error.name === 'TokenExpiredError') {
                throw new UnauthorizedException('Refresh token has expired');
            }
            throw new UnauthorizedException('Refresh token is not valid');
        }
    }
}
