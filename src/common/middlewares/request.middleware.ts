import { Injectable, Logger, NestMiddleware } from "@nestjs/common";
import { NextFunction } from "express";
import { StringUtils } from "../utils/string.utils";
import KEYS from "../../app.constants";

@Injectable()
export class RequestMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    Logger.debug(`${req.method} ${req["hostname"]}${req["originalUrl"]}`);
    req.headers[KEYS.REQUEST_ID] = StringUtils.random();
    req.headers[KEYS.REQUEST_TIMESTAMP] = Date.now();
    Logger.log(`[${req.headers[KEYS.REQUEST_ID]}]: Start request.....`);
    next();
  }
}
