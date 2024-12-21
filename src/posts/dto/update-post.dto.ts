import { IsNotEmpty, IsOptional } from "class-validator";

export class UpdatePostDto {
    @IsOptional()
    title?: string;

    @IsOptional()
    content?: string;

    @IsOptional()
    url?: string;
}
