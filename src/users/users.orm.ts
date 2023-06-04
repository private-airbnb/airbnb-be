import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import { Verification } from 'src/auth/jwt/entities/verification.entity';
import { Oauth } from './entities/oauth.entity';

const entities = [User, Role, Verification, Oauth];
const UserOrm = {
  entities: entities,
  ormModule: TypeOrmModule.forFeature(entities),
};

export default UserOrm;
