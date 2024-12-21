import { Injectable } from '@nestjs/common';
import { UserType } from '@prisma/client';
import { AuthModule } from 'src/auth/auth.module';
import { AuthService } from 'src/auth/auth.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AuthGoogleService {
    constructor(private prismaService: PrismaService,
        private authService: AuthService,
    ) { }

    async googleLogin(user: any) {
        try {
            const { socialId, email, firstName, lastName, profilePicture, accessToken } = user;

            const existingUser = await this.prismaService.user.findFirst({ where: { email } });

            if (!existingUser) {
                const newUser = await this.prismaService.user.create({
                    data: {
                        email,
                        firstName,
                        lastName,
                        provider: UserType.GOOGLE,
                        profilePicture,
                        socialId
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

                const payload = { id: newUser.id, email: newUser.email, role: newUser.role };

                const token = await this.authService.generateToken(payload);

                return {
                    user: newUser,
                    token: token,
                }
            } else {
                const updatedUser = await this.prismaService.user.update({
                    where: { email },
                    data: {
                        firstName: firstName || existingUser.firstName,
                        lastName: lastName || existingUser.lastName,
                        socialId
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

                const payload = { id: updatedUser.id, email: updatedUser.email, role: updatedUser.role };

                const token = await this.authService.generateToken(payload);

                return {
                    user: updatedUser,
                    token: token,
                }
            }
        } catch (error) {
            throw error;
        }
    }
}
