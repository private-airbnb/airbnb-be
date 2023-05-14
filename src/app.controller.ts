import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Anonymous } from './common/decorators/anonymous.decorator';

@Controller('app')
@Anonymous()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  healthCheck() {
    return this.appService.getHello();
  }
}
