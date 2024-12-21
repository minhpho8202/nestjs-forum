import { IsOptional, IsUrl } from "class-validator";

export class UpdateCommentDto {
    @IsOptional()
    content?: string;

    @IsOptional()
    @IsUrl()
    imageUrl?: string;
}
