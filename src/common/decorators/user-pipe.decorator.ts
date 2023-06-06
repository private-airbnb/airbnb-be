import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import AppUser from 'src/app.user';
import { DeviceDetector } from '../helpers/device-detector.helper';

const deviceDetector = new DeviceDetector();
export const UserPipe = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    if (request && request.user) {
      request.user = {
        ...request.user,
        device: deviceDetector.getDeviceOS(request.headers['user-agent']),
      };
    }
    const appUser = <AppUser>request.user;
    return appUser;
  },
);
