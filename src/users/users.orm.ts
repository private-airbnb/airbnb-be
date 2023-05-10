import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import { Verification } from 'src/auth/entities/varification.entity';

const entities = [User, Role, Verification];
const UserOrm = {
  entities: entities,
  ormModule: TypeOrmModule.forFeature(entities),
};

export default UserOrm;
