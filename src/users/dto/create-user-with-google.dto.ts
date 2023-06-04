import { IsEnum, IsString } from 'class-validator';
import { PickType } from '@nestjs/mapped-types';
import { User } from '../entities/user.entity';
import { AuthProvider } from 'src/common/enums/oauthProvider.enum';

export class CreateUserWithGoogleDto extends PickType(User, [
  'firstName',
  'lastName',
  'email',
  'avatar',
]) {
  @IsEnum(AuthProvider)
  provider: string;

  @IsString()
  providerId: string;
}
