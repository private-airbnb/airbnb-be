import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import KEYS from '../../app.constants';
import { LogService } from '../modules/log/log.service';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly logService: LogService) {}

  async catch(exception: HttpException, host: ArgumentsHost): Promise<void> {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    const loggedId = await this.logService
      .writeLog(exception, request)
      .catch((e) => {
        Logger.error(e);
        return null;
      });
    const detailError =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'INTERNAL_SERVER_ERROR';
    const requestId = request.headers[KEYS.REQUEST_ID];
    const now = request.headers[KEYS.REQUEST_TIMESTAMP];
    Logger.log(
      `[${requestId}] Request done in ${
        Date.now() - parseInt(now as string)
      }ms`,
    );
    response.set({ 'Access-Control-Allow-Origin': '*' }).status(status).json({
      loggedId,
      statusCode: status,
      path: request.url,
      timestamp: new Date().toISOString(),
      detailError,
    });
  }
}
