import { Module } from '@nestjs/common';
import { GoogleOauthController } from './google-oauth.controller';
import { GoogleOauthStrategy } from './strategies/google-oauth.strategy';
import { AuthModule } from '../jwt/auth.module';
import { UsersModule } from 'src/users/users.module';
import { AppSettings } from 'src/app.settings';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from 'src/common/constants/auth.constants';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    PassportModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '30 days' },
    }),
  ],
  controllers: [GoogleOauthController],
  providers: [GoogleOauthStrategy, AppSettings],
})
export class GoogleOauthModule {}
