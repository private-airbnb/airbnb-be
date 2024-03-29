import { Exclude } from 'class-transformer';
import { Role } from '../entities/role.entity';
import { User } from '../entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';

export class InfoUserDto {
  @ApiProperty()
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  lastLogin: Date;
  verified: boolean;
  bio: string;
  avatar: string;

  @Exclude()
  password: string;

  @Exclude()
  roles: Role[];

  constructor(partial: Partial<User>) {
    Object.assign(this, partial);
  }
}

export class InfoUserWithCredentialDto extends InfoUserDto {
  @ApiProperty()
  accessToken: string;

  constructor(partial: Partial<User>, accessToken: string) {
    super(partial);
    this.accessToken = accessToken;
  }
}
