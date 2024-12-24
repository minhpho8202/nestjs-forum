import { Controller, Get, Post, Body, Patch, Param, Delete, Request, UseGuards, Query, ParseIntPipe, DefaultValuePipe, UseInterceptors, UploadedFiles, Put, Res } from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { ApiQuery } from '@nestjs/swagger';
import { User } from 'src/common/decorators/user.decorator';
import { FilesInterceptor } from '@nestjs/platform-express';
import { PoliciesGuard } from 'src/casl/policies.guard';
import { CheckPolicies } from 'src/casl/ability.decorator';
import { Action } from 'src/casl/action.enum';
import { CommonService } from 'src/common/services/common.service';
import { Public } from 'src/common/decorators/public.decorator';

@Controller()
export class PostsController {
  constructor(private readonly postsService: PostsService,
    private readonly commonService: CommonService
  ) { }

  @Post('communities/:communityId/posts')
  @UseInterceptors(FilesInterceptor('images', 2))
  create(@UploadedFiles() images: Express.Multer.File[], @Body() createPostDto: CreatePostDto, @User() user: any, @Param('communityId', ParseIntPipe) communityId: number) {
    return this.postsService.create(createPostDto, user.id, images, communityId);
  }

  @Get('posts')
  @ApiQuery({
    name: 'search',
    required: false,
  })
  @ApiQuery({
    name: 'page',
    required: false,
  })
  @Public()
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('search') search?: string) {
    return this.postsService.findAll(page, search);
  }

  @Public()
  @Get('communities/:communityId/posts')
  findPostByCommunity(@User() user: any, @Param('communityId', ParseIntPipe) communityId: number,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('search') search?: string) {
    return this.postsService.findPostByCommunity(communityId, page, search)
  }

  @Public()
  @Get('posts/:id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.findOne(id);
  }

  @Patch('posts/:id')
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability) => ability.can(Action.Update, 'Post'))
  update(@Param('id', ParseIntPipe) id: number, @Body() updatePostDto: UpdatePostDto, @User() user: any) {
    return this.postsService.update(id, updatePostDto, user.id);
  }

  @Patch('posts/:id/delete')
  toggleDeleteStatus(@Param('id', ParseIntPipe) id: number) {
    return this.commonService.toggleStatus(id, 'post', 'isDeleted');
  }

  @Patch('posts/:id/active')
  toggleActiveStatus(@Param('id', ParseIntPipe) id: number) {
    return this.commonService.toggleStatus(id, 'post', 'isActived');
  }
}
