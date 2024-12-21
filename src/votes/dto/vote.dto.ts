import { IsIn, IsOptional } from "class-validator";

export class VoteDto {
    @IsOptional()
    postId?: number;

    @IsOptional()
    commentId?: number;

    @IsIn([1, -1], { message: 'Vote type must be 1 (upvote) or -1 (downvote)' })
    voteType: number;
}
