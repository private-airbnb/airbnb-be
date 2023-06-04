import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Email } from './entities/email.entity';
import { AppSettings } from 'src/app.settings';

@Module({
  imports: [TypeOrmModule.forFeature([Email])],
  providers: [MailService, AppSettings],
  exports: [MailService],
})
export class MailModule {}
