import { PickType } from '@nestjs/mapped-types';
import { User } from '../entities/user.entity';
import { Oauth } from '../entities/oauth.entity';
import { IsEmail } from 'class-validator';

export class SignInUserDTO extends PickType(User, ['email', 'password']) {}

export class SignInGoogleUserDTO extends PickType(Oauth, ['providerId']) {
  @IsEmail()
  email: string;
}
