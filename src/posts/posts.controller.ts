import { Controller, Get, Post, Body, Patch, Param, Delete, Request, UseGuards, Query, ParseIntPipe, DefaultValuePipe, UseInterceptors, UploadedFiles, Put, Res } from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { ApiQuery } from '@nestjs/swagger';
import { User } from 'src/common/decorators/user.decorator';
import { FileFieldsInterceptor, FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { PoliciesGuard } from 'src/casl/policies.guard';
import { CheckPolicies } from 'src/casl/ability.decorator';
import { Action } from 'src/casl/action.enum';
import { CommonService } from 'src/common/services/common.service';
import { Public } from 'src/common/decorators/public.decorator';
import { Response } from 'express';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService,
    private readonly commonService: CommonService
  ) { }

  @Post()
  @UseInterceptors(FilesInterceptor('images', 2))
  create(@UploadedFiles() images: Express.Multer.File[], @Body() createPostDto: CreatePostDto, @User() user: any) {
    return this.postsService.create(createPostDto, user.id, images);
  }

  @Get()
  @ApiQuery({
    name: 'search',
    required: false,
  })
  @ApiQuery({
    name: 'page',
    required: false,
  })
  @Public()
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('search') search?: string) {
    return this.postsService.findAll(page, search);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability) => ability.can(Action.Update, 'Post'))
  async update(@Param('id', ParseIntPipe) id: number, @Body() updatePostDto: UpdatePostDto, @User() user: any) {
    return this.postsService.update(id, updatePostDto, user.id);
  }

  @Patch(':id/delete')
  toggleDeleteStatus(@Param('id', ParseIntPipe) id: number) {
    return this.commonService.toggleStatus(id, 'post', 'isDeleted');
  }

  @Patch(':id/active')
  toggleActiveStatus(@Param('id', ParseIntPipe) id: number) {
    return this.commonService.toggleStatus(id, 'post', 'isActived');
  }
}
