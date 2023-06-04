import { PickType } from '@nestjs/mapped-types';
import { IsBoolean, IsEmail, IsOptional, IsString } from 'class-validator';
import { User } from '../entities/user.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto extends PickType(User, [
  'firstName',
  'lastName',
  'email',
  'password',
]) {
  @ApiProperty()
  @IsBoolean()
  isHost: boolean;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isAdmin?: boolean;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  adminSecretKey?: string;
}
