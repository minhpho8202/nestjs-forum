import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SavedPostsService {
  constructor(private prismaService: PrismaService,) { }

  async toggleSavePost(postId: number, userId: number) {
    try {
      const post = await this.prismaService.post.findUnique({ where: { id: postId } });

      if (!post) {
        throw new NotFoundException("Post not found");
      }

      const existingSavedPost = await this.prismaService.savedPost.findFirst({
        where: { postId, userId },
      });

      if (existingSavedPost) {
        await this.prismaService.savedPost.delete({
          where: { id: existingSavedPost.id },
        });
        return { message: "Post has been removed from saved posts" };
      } else {
        const savedPost = await this.prismaService.savedPost.create({
          data: { postId, userId },
        });
        return { message: "Post has been saved" };
      }
    } catch (error) {
      throw error;
    }
  }
}
