import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import { Verification } from '../auth/jwt/entities/verification.entity';
import { MailModule } from '../mail/mail.module';
import CourseOrm from './users.orm';
import UserRepository from './repositories/user.repository';
import RoleRepository from './repositories/role.repository';
import VerificationRepository from './repositories/verification.repository';
import { PasswordHelper } from 'src/common/helpers/password.helper';
import { TokenHelper } from 'src/common/helpers/token.helper';
import { AuthModule } from 'src/auth/jwt/auth.module';
import OAuthRepository from './repositories/oauth.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserRepository, ...CourseOrm.entities]),
    AuthModule,
    MailModule,
  ],
  controllers: [UsersController],
  providers: [
    TokenHelper,
    UsersService,
    UserRepository,
    RoleRepository,
    PasswordHelper,
    VerificationRepository,
    OAuthRepository,
  ],
  exports: [UsersService],
})
export class UsersModule {}
