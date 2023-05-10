import { Module } from "@nestjs/common";
import { UsersService } from "./users.service";
import { UsersController } from "./users.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./entities/user.entity";
import { Role } from "./entities/role.entity";
import { Verification } from "../auth/entities/varification.entity";
import { MailModule } from "../mail/mail.module";
import { AuthModule } from "../auth/auth.module";
import CourseOrm from "./users.orm";
import UserRepository from "./user.repository";
import RoleRepository from "./role.repository";
import VerificationRepository from "./verification.repository";

@Module({
  imports: [TypeOrmModule.forFeature([UserRepository, ...CourseOrm.entities]), AuthModule, MailModule],
  controllers: [UsersController],
  providers: [UsersService, UserRepository, RoleRepository, VerificationRepository],
  exports: [UsersService],
})
export class UsersModule {}
