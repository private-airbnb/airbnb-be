import { Body, Controller, Get, Logger, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { Anonymous } from './common/decorators/anonymous.decorator';
import { MailService } from './mail/mail.service';
import { TestMailDto } from './mail/dto/test-mail.dto';

@Anonymous()
@Controller('app')
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly mailService: MailService,
  ) {}

  @Get()
  healthCheck() {
    return this.appService.getHello();
  }

  @Post('test-email')
  async testSendEmail(@Body() model: TestMailDto): Promise<any> {
    const info = await this.mailService.sendTestEmail(model.email);
    Logger.log(`Emailed with id ${info.messageId} completed.`);
    return info;
  }
}
