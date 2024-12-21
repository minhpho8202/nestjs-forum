import { IsNotEmpty, IsString, Length } from "class-validator";

export class CreateCommunityDto {
    @IsNotEmpty()
    @IsString()
    @Length(5, 20)
    name: string;

    @IsNotEmpty()
    @IsString()
    @Length(5, 100)
    description: string;
}
