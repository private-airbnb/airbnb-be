import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Log } from './log.entity';

@Injectable()
export class LogService {
  constructor(
    @InjectRepository(Log) private readonly logRepository: Repository<Log>,
  ) {}

  async writeLog(
    exception: any,
    request: Record<string, any>,
  ): Promise<number> {
    const log = new Log();
    log.generatedBy = request.user?.id;
    log.url = request.originalUrl;
    log.detail = exception?.response?.error;
    log.general = exception.message || exception.error;
    const result = await this.logRepository.save(log);
    return result.id;
  }
}
