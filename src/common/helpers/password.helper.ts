import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as generator from 'generate-password';

@Injectable()
export class PasswordHelper {
  constructor(private readonly configService: ConfigService) {}

  async getCiphertext(plaintext: string): Promise<string> {
    const hash = await bcrypt.hash(
      plaintext,
      +this.configService.get<string>('SALT_OR_ROUND'),
    );
    return hash;
  }

  async isCompare(plaintext: string, ciphertext: string): Promise<boolean> {
    const isCompare = await bcrypt.compare(plaintext, ciphertext);
    return isCompare;
  }

  randomizePassword() {
    return generator.generate({
      length: 16,
      numbers: true,
      uppercase: true,
    });
  }
}
