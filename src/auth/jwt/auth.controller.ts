import { Controller, Get, Param } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Anonymous } from 'src/common/decorators/anonymous.decorator';
@Anonymous()
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('/verification/:code')
  async verify(@Param('code') code: string) {
    return this.authService.verifyEmail(code);
  }
}
