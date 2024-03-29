import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { User } from '../../../users/entities/user.entity';
import { CoreEntity } from '../../../common/entities/core.entity';

@Entity()
export class Verification extends CoreEntity {
  @Column({ unique: true })
  code: string;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;
}
