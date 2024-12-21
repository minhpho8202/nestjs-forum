import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGoogleService } from './auth-google.service';
import { AuthGuard } from '@nestjs/passport';
import { Public } from 'src/common/decorators/public.decorator';

@Controller('auth/google')
export class AuthGoogleController {
  constructor(private readonly authGoogleService: AuthGoogleService) { }

  @Public()
  @Get()
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
  }

  @Public()
  @Get('redirect')
  @UseGuards(AuthGuard('google'))
  googleAuthRedirect(@Req() req) {
    return this.authGoogleService.googleLogin(req.user);
  }
}
