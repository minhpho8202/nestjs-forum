import { Global, Injectable, NotFoundException } from '@nestjs/common';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Injectable()
export class CommentsService {
    constructor(private prismaService: PrismaService,
        private cloudinaryService: CloudinaryService,
    ) { }

    async create(postId: number, createCommentDto: CreateCommentDto, userId: number, image: Express.Multer.File) {
        try {
            const data = { ...createCommentDto, userId, postId };

            if (image) {
                const response = await this.cloudinaryService.uploadImage(image);
                data.imageUrl = response.secure_url;
            }

            const post = await this.prismaService.comment.create({ data: data });

            return post;
        } catch (error) {
            throw error;
        }
    }

    async update(id: number, updateCommentDto: UpdateCommentDto) {
        try {
            const comment = await this.prismaService.comment.findFirst({ where: { id } });

            if (!comment) {
                throw new NotFoundException("Comment not found");
            }

            const updatedComment = await this.prismaService.comment.update(
                {
                    where: { id },
                    data: updateCommentDto
                }
            );

            return updatedComment;
        } catch (error) {
            throw error;
        }
    }
}
