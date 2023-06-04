import { HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { customThrowError } from 'src/common/utils/throw.utils';
import { User } from 'src/users/entities/user.entity';
import { Verification } from './entities/verification.entity';
import { IPayload } from 'src/common/interfaces/auth.inferfaces';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Verification)
    private readonly verificationRepository: Repository<Verification>,
  ) {}

  async getUserByPayload(payload: IPayload): Promise<User> {
    return await this.userRepository.findOneBy({ id: payload.id });
  }

  async verifyEmail(code: string): Promise<boolean> {
    const verification = await this.verificationRepository.findOne({
      where: { code: code },
      relations: ['user'],
    });
    if (!verification) {
      customThrowError('This is an invalid code.', HttpStatus.BAD_REQUEST);
    }

    verification.user.verified = true;
    await this.userRepository.save(verification.user);
    await this.verificationRepository.delete(verification.id);
    return true;
  }
}
