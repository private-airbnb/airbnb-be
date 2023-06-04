import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { GoogleOauthGuard } from './google-oauth.guard';
import { Anonymous } from 'src/common/decorators/anonymous.decorator';

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
  googleAuthRedirect(@Req() req: Request, @Res() res: Response) {
    // For now, we'll just show the user object
    return req.user;
  }
}
