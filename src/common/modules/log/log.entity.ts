import { CoreEntity } from 'src/common/entities/core.entity';
import { Column, Entity } from 'typeorm';

@Entity()
export class Log extends CoreEntity {
  @Column({
    nullable: true,
  })
  general: string;

  @Column({
    nullable: true,
  })
  detail: string;

  @Column({
    nullable: true,
  })
  generatedBy: number;

  @Column({
    nullable: true,
  })
  url: string;

  @Column({
    nullable: true,
  })
  ip: string;
}
