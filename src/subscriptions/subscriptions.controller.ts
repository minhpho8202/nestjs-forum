import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { User } from 'src/common/decorators/user.decorator';

@Controller('communities/:communityId/subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) { }

  @Post()
  toggleSubscription(@Param('communityId', ParseIntPipe) communityId: number, @User() user: any) {
    return this.subscriptionsService.toggleSubscription(communityId, user.id);
  }
}
