import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDTO } from './dto/register.dto';
import { LoginDTO } from './dto/login.dto';
import { Public } from 'src/common/decorators/public.decorator';
import { ResetPasswordDTO } from './dto/reset-password.dto';

@Public()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('register')
  signup(@Body() registerDTO: RegisterDTO) {
    return this.authService.register(registerDTO);
  }

  @Get('confirm')
  async confirm(@Query('token') token: string) {
    return this.authService.confirmEmail(token);
  }

  @Post('forget-password')
  async forgetPassword(@Body('email') email: string) {
    return await this.authService.forgetPassword(email);
  }

  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDTO: ResetPasswordDTO) {
    return await this.authService.resetPassword(resetPasswordDTO);
  }

  @Post('login')
  signin(@Body() loginDTO: LoginDTO) {
    return this.authService.login(loginDTO);
  }

  @Post('refresh-token')
  refreshToken(@Body() { refreshToken }) {
    return this.authService.refreshToken(refreshToken);
  }
}
