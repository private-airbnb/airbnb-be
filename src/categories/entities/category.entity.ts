import { IsString } from 'class-validator';
import { CoreEntity } from '../../common/entities/core.entity';
import { Photo } from '../../photos/entries/photo.entity';
import { Column, Entity, JoinTable, ManyToMany, OneToOne } from 'typeorm';
import { Room } from 'src/rooms/entities/room.entity';

@Entity()
export class Category extends CoreEntity {
  @Column({ type: 'varchar' })
  @IsString()
  name: string;

  @OneToOne(() => Photo, (photo) => photo.room)
  photo: Photo;

  @ManyToMany(() => Room, { cascade: true })
  @JoinTable({
    name: 'category_room',
    joinColumn: { name: 'category_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'room_id', referencedColumnName: 'id' },
  })
  rooms: Room[];
}
