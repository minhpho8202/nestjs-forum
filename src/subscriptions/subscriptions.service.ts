import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SubscriptionsService {
  constructor(private prismaService: PrismaService,) { }

  async toggleSubscription(communityId: number, userId: number) {
    try {
      const community = await this.prismaService.community.findUnique({ where: { id: communityId } });

      if (!community) {
        throw new NotFoundException("Community not found");
      }

      const existingSubscription = await this.prismaService.subscription.findFirst({
        where: { communityId, userId },
      });

      if (existingSubscription) {
        await this.prismaService.subscription.delete({
          where: { id: existingSubscription.id },
        });
        await this.prismaService.community.update({
          where: { id: communityId },
          data: { subscriptionCount: { decrement: 1 } },
        });
        return { message: "Unsubscribed from community" };
      } else {
        const subscription = await this.prismaService.subscription.create({
          data: { communityId, userId },
        });
        await this.prismaService.community.update({
          where: { id: communityId },
          data: { subscriptionCount: { increment: 1 } },
        });
        return { message: "Subscribed to community" };
      }
    } catch (error) {
      throw error;
    }
  }
}
