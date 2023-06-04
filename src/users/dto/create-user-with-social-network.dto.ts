import { IsEnum, IsString } from 'class-validator';
import { PickType } from '@nestjs/mapped-types';
import { User } from '../entities/user.entity';
import { AuthProvider } from 'src/common/enums/oauthProvider.enum';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserWithSocialNetworkDto extends PickType(User, [
  'firstName',
  'lastName',
  'email',
  'avatar',
]) {
  @ApiProperty()
  @IsEnum(AuthProvider)
  provider: string;

  @ApiProperty()
  @IsString()
  providerId: string;
}

export class IntegrateWithSocialNetworkDto extends PickType(
  CreateUserWithSocialNetworkDto,
  ['provider', 'providerId'] as const,
) {}
