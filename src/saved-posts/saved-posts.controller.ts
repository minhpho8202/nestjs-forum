import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards } from '@nestjs/common';
import { SavedPostsService } from './saved-posts.service';
import { User } from 'src/common/decorators/user.decorator';

@Controller('posts/:postId/saved-posts')
export class SavedPostsController {
  constructor(private readonly savedPostsService: SavedPostsService) { }

  @Post()
  toggleSavePost(@Param('postId', ParseIntPipe) postId: number, @User() user: any) {
    return this.savedPostsService.toggleSavePost(postId, user.id);
  }
}
