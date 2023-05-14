import { CustomDecorator, SetMetadata } from '@nestjs/common';
import { IS_PUBLIC } from '../constants/metadata';

export const Anonymous = (): CustomDecorator<string> =>
  SetMetadata(IS_PUBLIC, true);
