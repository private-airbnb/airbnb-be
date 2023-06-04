import { AuthProvider } from 'src/common/enums/oauthProvider.enum';
import { CoreEntity } from '../../common/entities/core.entity';
import { User } from './user.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity()
export class Oauth extends CoreEntity {
  @Column({ type: 'varchar', length: 255 })
  providerId: string;

  @Column({ type: 'enum', enum: AuthProvider })
  provider: string;

  @Column()
  userId: number;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'userId' })
  user: User;
}
