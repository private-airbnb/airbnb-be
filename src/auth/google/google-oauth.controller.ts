import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { Anonymous } from 'src/common/decorators/anonymous.decorator';
import { GoogleOauthGuard } from 'src/common/guards/google-oauth.guard';

@Anonymous()
@Controller('auth/google')
export class GoogleOauthController {
  @Get()
  @UseGuards(GoogleOauthGuard)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async googleAuth(@Req() req) {
    // Guard redirects
  }

  @Get('redirect')
  @UseGuards(GoogleOauthGuard)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  googleAuthRedirect(@Req() req: Request) {
    // For now, we'll just show the user object
    return req.user;
  }
}
