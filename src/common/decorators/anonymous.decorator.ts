import { CustomDecorator, SetMetadata } from '@nestjs/common';
import { IS_PUBLIC_KEY } from '../constants/metadata';

export const Anonymous = (): CustomDecorator<string> =>
  SetMetadata(IS_PUBLIC_KEY, true);
