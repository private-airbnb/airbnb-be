import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User } from 'src/users/entities/user.entity';
import { JwtStrategy } from './strategies/jwt.strategy';
import { Verification } from './entities/verification.entity';
import { AppSettings } from 'src/app.settings';

const appSettings = AppSettings.forRoot();

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: appSettings.jwt.secret,
      signOptions: {
        expiresIn: appSettings.jwt.accessExpires,
      },
    }),
    TypeOrmModule.forFeature([User, Verification]),
  ],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
