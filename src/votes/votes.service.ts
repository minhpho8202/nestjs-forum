import { ForbiddenException, Injectable } from '@nestjs/common';
import { VoteDto } from './dto/vote.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Vote } from '@prisma/client';

@Injectable()
export class VotesService {
  constructor(private prismaService: PrismaService,) { }

  async vote(voteDto: VoteDto, userId: number) {
    try {
      const { postId, commentId, voteType } = voteDto;

      if ((postId && commentId) || (!postId && !commentId)) {
        throw new Error('You must specify either postId or commentId, but not both.');
      }

      let existingVote: Vote;

      if (postId) {
        existingVote = await this.prismaService.vote.findFirst({
          where: { postId, userId },
        });
      } else if (commentId) {
        existingVote = await this.prismaService.vote.findFirst({
          where: { commentId, userId },
        });
      }

      if (existingVote) {
        await this.prismaService.vote.delete({ where: { id: existingVote.id } });

        if (postId) {
          await this.prismaService.post.update({
            where: { id: postId },
            data: voteType === 1 ? { voteCount: { decrement: 1 } } : { voteCount: { decrement: 1 } },
          });
        } else if (commentId) {
          await this.prismaService.comment.update({
            where: { id: commentId },
            data: voteType === 1 ? { voteCount: { decrement: 1 } } : { voteCount: { decrement: 1 } },
          });
        }

        return { message: 'Vote removed' };
      } else {
        const newVote = await this.prismaService.vote.create({
          data: {
            userId,
            postId: postId || null,
            commentId: commentId || null,
            voteType,
          },
        });

        if (postId) {
          await this.prismaService.post.update({
            where: { id: postId },
            data: voteType === 1 ? { voteCount: { increment: 1 } } : { voteCount: { increment: 1 } },
          });
        } else if (commentId) {
          await this.prismaService.comment.update({
            where: { id: commentId },
            data: voteType === 1 ? { voteCount: { increment: 1 } } : { voteCount: { increment: 1 } },
          });
        }

        return { message: 'Vote added', vote: newVote };
      }
    } catch (error) {
      throw error;
    }
  }
}
