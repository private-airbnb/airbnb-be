import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy, VerifyCallback } from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppSettings } from 'src/app.settings';
import { UsersService } from 'src/users/users.service';
import { CreateUserWithSocialNetworkDto } from 'src/users/dto/create-user-with-social-network.dto';

@Injectable()
export class GoogleOauthStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
    private readonly appSettings: AppSettings,
  ) {
    super({
      clientID:
        configService.get<string>('OAUTH_GOOGLE_CLIENT_ID') ||
        appSettings.oauthGoogle.googleClientId,
      clientSecret:
        configService.get<string>('OAUTH_GOOGLE_SECRET') ||
        appSettings.oauthGoogle.googleSecret,
      callbackURL:
        configService.get<string>('OAUTH_GOOGLE_REDIRECT') ||
        appSettings.oauthGoogle.googleRedirect,
      scope: ['email', 'profile'],
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): Promise<any> {
    const { id, name, emails, photos, provider } = profile;

    const model: CreateUserWithSocialNetworkDto = {
      providerId: id,
      firstName: name.givenName,
      lastName: name.familyName,
      email: emails[0].value,
      avatar: photos[0].value,
      provider,
    };

    const validateResult = await this.usersService.loginWithSocialNetwork(
      model,
    );
    done(null, validateResult);
  }
}
