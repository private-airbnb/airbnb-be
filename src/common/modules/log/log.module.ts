import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LogService } from './log.service';
import { Log } from './log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Log])],
  providers: [LogService],
  controllers: [],
})
export class LogModule {}
