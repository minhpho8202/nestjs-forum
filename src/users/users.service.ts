import { BadRequestException, HttpException, HttpStatus, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateUserDTO } from './dto/update-user.dto';
import * as argon from 'argon2';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Injectable()
export class UsersService {
    constructor(
        private prismaService: PrismaService,
        private cloudinaryService: CloudinaryService,
    ) { }

    async findOne(id: number) {
        try {
            const user = await this.prismaService.user.findFirst({
                where: {
                    id,
                    AND: [
                        { isActived: true },
                        { isDeleted: false },
                    ],
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

            if (!user) {
                throw new NotFoundException('User not found');
            }

            return user;
        } catch (error) {
            throw error;
        }
    }

    async update(id: number, updateUserDTO: UpdateUserDTO, image: Express.Multer.File) {
        try {
            const user = await this.prismaService.user.findFirst({ where: { id }, select: { password: true } });

            if (!user) {
                throw new NotFoundException("User not found");
            }

            if (image) {
                const response = await this.cloudinaryService.uploadImage(image);
                updateUserDTO.profilePicture = response.secure_url;
            }

            if (updateUserDTO.newPassword) {
                if (updateUserDTO.newPassword !== updateUserDTO.confirmPassword) {
                    throw new BadRequestException('Password and confirm password do not match.');
                }
                const checkPassword = await argon.verify(user.password, updateUserDTO.password);
                if (!checkPassword) {
                    throw new UnauthorizedException('Invalid password');
                }
                updateUserDTO.password = await argon.hash(updateUserDTO.newPassword);
            }

            const updatedUser = await this.prismaService.user.update({
                where: { id },
                data: updateUserDTO,
                select: {
                    id: true,
                    username: true,
                    email: true,
                    profilePicture: true,
                    bio: true,
                    role: true,
                },
            });
            return updatedUser;
        } catch (error) {
            throw error;
        }
    }


    async findAll(page: number = 1, search?: string) {
        try {
            const take = 2;
            const skip = (page - 1) * take;

            let condition: any = {
                isActived: true,
                isDeleted: false,
            };

            if (search) {
                condition = {
                    ...condition,
                    OR: [
                        { username: { contains: search, mode: 'insensitive' } },
                        { email: { contains: search, mode: 'insensitive' } }
                    ]
                };
            }

            const [users, totalUsers] = await this.prismaService.$transaction([
                this.prismaService.user.findMany({
                    where: condition,
                    select: {
                        id: true,
                        username: true,
                        email: true,
                        profilePicture: true,
                        bio: true,
                        role: true,
                    },
                    orderBy: [
                        { createdAt: 'desc' },
                        { updatedAt: 'desc' }
                    ],
                    skip,
                    take
                }),

                this.prismaService.user.count({
                    where: condition
                })
            ]);

            const totalPages = Math.ceil(totalUsers / take);

            return { users, totalPages };
        } catch (error) {
            throw error;
        }
    }

}
