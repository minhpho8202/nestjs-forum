import { Body, Controller, Param, ParseIntPipe, Patch, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { User } from 'src/common/decorators/user.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from 'src/auth/auth.guard';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { CommonService } from 'src/common/services/common.service';

@Controller('posts/:postId/comments')
export class CommentsController {
    constructor(private readonly commentsService: CommentsService,
        private readonly commonService: CommonService
    ) { }
    @Post()
    @UseInterceptors(FileInterceptor('image'))
    create(@Param('postId', ParseIntPipe) postId: number, @UploadedFile() image: Express.Multer.File, @User() user: any, @Body() createCommentDto: CreateCommentDto) {
        return this.commentsService.create(postId, createCommentDto, user.id, image);
    }

    @Patch('/:id')
    update(@Param('id', ParseIntPipe) id: number, @Body() updateCommentDto: UpdateCommentDto) {
        return this.commentsService.update(id, updateCommentDto);
    }

    @Patch(':id/delete')
    toggleDeleteStatus(@Param('id', ParseIntPipe) id: number) {
        return this.commonService.toggleStatus(id, 'comment', 'isDeleted');
    }

    @Patch(':id/active')
    toggleActiveStatus(@Param('id', ParseIntPipe) id: number) {
        return this.commonService.toggleStatus(id, 'comment', 'isActived');
    }

}
