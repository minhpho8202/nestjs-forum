import { IsEmail, IsOptional, ValidateIf } from "class-validator";

export class UpdateUserDTO {
    @ValidateIf((obj) => obj.email !== "")
    @IsEmail()
    @IsOptional()
    email?: string;

    @IsOptional()
    password?: string;

    @IsOptional()
    newPassword?: string;

    @IsOptional()
    confirmPassword?: string;

    @IsOptional()
    profilePicture?: string;

    @IsOptional()
    bio?: string;
}
