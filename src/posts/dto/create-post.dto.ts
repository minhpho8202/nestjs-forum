import { Transform } from "class-transformer";
import { IsInt, IsNotEmpty, IsOptional, IsPositive, IsString, IsUrl, Length } from "class-validator";

export class CreatePostDto {
    @IsNotEmpty()
    @IsString()
    @Length(5, 100)
    title: string;

    @IsNotEmpty()
    @IsString()
    @Length(5, 1000)
    content: string;

    // @Transform(({ value }) => parseInt(value, 10))
    // @IsNotEmpty()
    // @IsInt()
    // @IsPositive()
    // communityId: number

    @IsString()
    @IsOptional()
    @IsUrl()
    url?: string;

    @IsString()
    @IsOptional()
    @IsUrl()
    imageUrl?: string;
}
