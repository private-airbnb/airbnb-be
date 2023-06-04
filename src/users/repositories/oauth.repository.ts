import { Injectable } from '@nestjs/common';
import { Oauth } from '../entities/oauth.entity';
import { makeBaseRepository } from 'src/common/repositories/base.repository';

@Injectable()
export default class OAuthRepository extends makeBaseRepository(Oauth) {}
