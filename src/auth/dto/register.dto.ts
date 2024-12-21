import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class RegisterDTO {
    @IsNotEmpty()
    @IsString()
    username: string;

    @IsNotEmpty()
    @IsString()
    password: string;

    @IsEmail()
    @IsNotEmpty()
    email: string;
}