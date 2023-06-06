import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jsonwebtoken from 'jsonwebtoken';
import { SignOptions } from 'jsonwebtoken';
import { customThrowError } from '../utils/throw.utils';

@Injectable()
export class TokenHelper {
  private tokenSecret = '';

  constructor(private readonly configService: ConfigService) {
    this.tokenSecret = this.configService.get<string>('TOKEN_SECRET');
  }

  createToken(
    payload: Record<string, any>,
    expiresIn?: string | number,
  ): string {
    try {
      const options: SignOptions = { algorithm: 'HS512', expiresIn };
      const token = jsonwebtoken.sign(payload, this.tokenSecret, options);
      return token;
    } catch (error: any) {
      customThrowError(
        'Create token error',
        HttpStatus.INTERNAL_SERVER_ERROR,
        '',
        error,
      );
    }
  }

  verifyToken(token: string): any {
    try {
      return jsonwebtoken.verify(token, this.tokenSecret);
    } catch (error: any) {
      customThrowError(
        'Invalid Credential',
        HttpStatus.UNAUTHORIZED,
        '',
        error,
      );
    }
  }
}
