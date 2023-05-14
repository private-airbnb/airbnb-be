import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { instanceToInstance } from 'class-transformer';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import KEYS from 'src/app.constants';
import { StringUtils } from '../utils/string.utils';

const EVENT_STREAM_URI = '/notifications/sse';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    if (['rpc'].includes(context.getType())) {
      return this.processRpcContext(context, next);
    } else {
      return this.processHttpContext(context, next);
    }
  }

  processHttpContext(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const res = context.switchToHttp().getResponse();
    const requestId = req.headers[KEYS.REQUEST_ID];
    const now = req.headers[KEYS.REQUEST_TIMESTAMP];
    return next.handle().pipe(
      map((data) => {
        Logger.log(`[${requestId}] Request done in ${Date.now() - now}ms`);
        if (req.originalUrl.includes(EVENT_STREAM_URI)) return data;
        if (
          (data && data.statusCode && data.statusCode == 302) ||
          (data && data.status && data.status == 302)
        )
          res.redirect(data.statusCode, data.url);
        else {
          const ret = instanceToInstance(data, { enableCircularCheck: true });
          return instanceToInstance({
            success: true,
            status: 200,
            result: ret,
            timestamp: `${Date.now() - now}ms`,
          });
        }
      }),
    );
  }

  processRpcContext(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> {
    const requestId = StringUtils.random();
    const now = Date.now();
    const ctx = context.getArgs().slice(-1)[0];
    ctx.args.push({ requestId, now });
    Logger.log(`[${requestId}] RPC Request starts....`);
    return next.handle().pipe(
      map((data: any) => {
        Logger.log(`[${requestId}] RPC Request done in ${Date.now() - now}ms`);
        if (data) {
          const ret = instanceToInstance(data, { enableCircularCheck: true });
          return instanceToInstance({
            success: true,
            status: 200,
            result: ret,
            timestamp: `${Date.now() - now}ms`,
          });
        }
      }),
    );
  }
}
