import {
  ExecutionContext,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { customThrowError } from '../utils/throw.utils';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const activated: any = super.canActivate(context);

    if (activated.catch) {
      activated.catch((error) => {
        Logger.error(error);
      });
    }
    return <boolean | Promise<boolean>>activated;
  }

  handleRequest(err, user) {
    if (err || !user) {
      throw (
        err ||
        new customThrowError('Login is required', HttpStatus.UNAUTHORIZED)
      );
    }
    return user;
  }
}
