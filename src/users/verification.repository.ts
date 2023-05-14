import { Injectable } from '@nestjs/common';
import { makeBaseRepository } from '../common/repositories/base.repository';
import { Verification } from 'src/auth/entities/varification.entity';

@Injectable()
export default class VerificationRepository extends makeBaseRepository(
  Verification,
) {}
