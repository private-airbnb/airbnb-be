import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { User } from '../../../users/entities/user.entity';
import { AuthService } from '../auth.service';
import { AppSettings } from 'src/app.settings';

const appSettings = AppSettings.forRoot();

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: appSettings.jwt.secret,
      passReqToCallback: true,
    });
  }

  async validate(payload: any): Promise<User> {
    const user: User = await this.authService.getUserByPayload(payload);
    if (!user) throw new NotFoundException('This user does not exist.');
    if (!user.verified)
      throw new BadRequestException('Please complete email verification.');
    return user;
  }
}
