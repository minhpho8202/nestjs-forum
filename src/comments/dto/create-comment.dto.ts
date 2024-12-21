import { Transform } from "class-transformer";
import { IsInt, IsNotEmpty, IsOptional, IsPositive, IsString, IsUrl, Length } from "class-validator";

export class CreateCommentDto {
    @IsNotEmpty()
    @IsString()
    @Length(5, 200)
    content: string;

    // @Transform(({ value }) => parseInt(value, 10))
    // @IsNotEmpty()
    // @IsInt()
    // @IsPositive()
    // postId: number

    @IsString()
    @IsOptional()
    @IsUrl()
    imageUrl?: string;
}
