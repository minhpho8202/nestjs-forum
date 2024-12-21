import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { VotesService } from './votes.service';
import { VoteDto } from './dto/vote.dto';
import { User } from 'src/common/decorators/user.decorator';

@Controller()
export class VotesController {
  constructor(private readonly votesService: VotesService) { }

  @Post('posts/:postId/votes')
  votePost(@Body() voteDto: VoteDto, @User() user: any) {
    return this.votesService.vote(voteDto, user.id);
  }

  @Post('comments/:commentId/votes')
  voteComment(@Body() voteDto: VoteDto, @User() user: any) {
    return this.votesService.vote(voteDto, user.id);
  }
}
