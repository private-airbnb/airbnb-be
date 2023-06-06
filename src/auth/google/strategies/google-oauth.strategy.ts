import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy, VerifyCallback } from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';
import { AppSettings } from 'src/app.settings';
import { UsersService } from 'src/users/users.service';
import { CreateUserWithSocialNetworkDto } from 'src/users/dto/create-user-with-social-network.dto';

const appSettings = AppSettings.forRoot();

@Injectable()
export class GoogleOauthStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly usersService: UsersService) {
    super({
      clientID: appSettings.oauthGoogle.googleClientId,
      clientSecret: appSettings.oauthGoogle.googleSecret,
      callbackURL: appSettings.oauthGoogle.googleRedirect,
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
