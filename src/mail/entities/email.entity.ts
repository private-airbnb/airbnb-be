import { Column, Entity } from 'typeorm';
import { CoreEntity } from 'src/common/entities/core.entity';

@Entity()
export class Email extends CoreEntity {
  @Column({
    nullable: false,
  })
  from: string;
  @Column({
    nullable: false,
  })
  to: string;

  @Column({
    nullable: true,
  })
  subject: string;

  @Column({
    nullable: true,
  })
  body: number;

  @Column({
    nullable: true,
  })
  lastError: string;
}
