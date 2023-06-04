import { Module } from '@nestjs/common';
import { GoogleOauthController } from './google-oauth.controller';
import { GoogleOauthStrategy } from './strategies/google-oauth.strategy';
import { UsersModule } from 'src/users/users.module';
import { AppSettings } from 'src/app.settings';

@Module({
  imports: [UsersModule],
  controllers: [GoogleOauthController],
  providers: [GoogleOauthStrategy, AppSettings],
})
export class GoogleOauthModule {}
