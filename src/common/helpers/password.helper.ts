import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as generator from 'generate-password';
import { AppSettings } from 'src/app.settings';

@Injectable()
export class PasswordHelper {
  constructor(private readonly appSettings: AppSettings) {}

  async getCiphertext(plaintext: string): Promise<string> {
    const hash = await bcrypt.hash(
      plaintext,
      +this.appSettings.jwt.saltOrRound,
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
