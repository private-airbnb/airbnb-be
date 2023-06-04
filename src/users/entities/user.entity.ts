import { IsBoolean, IsDate, IsEmail, IsString } from 'class-validator';
import { CoreEntity } from '../../common/entities/core.entity';
import { Payment } from '../../common/entities/payment.entity';
import { Reservation } from '../../reservations/entities/reservation.entity';
import { Room } from '../../rooms/entities/room.entity';
import { Column, Entity, ManyToMany, OneToMany } from 'typeorm';
import { Conversation } from '../../common/entities/conversation.entity';
import { Message } from '../../common/entities/message.entity';
import { List } from '../../lists/entities/list.entity';
import { Review } from '../../reviews/entities/review.entity';
import { Role } from './role.entity';
import { Exclude, Expose } from 'class-transformer';
import { Oauth } from './oauth.entity';

@Entity()
export class User extends CoreEntity {
  @Column({ type: 'varchar', length: 255 })
  @IsString()
  firstName: string;

  @Column({ type: 'varchar', length: 255 })
  @IsString()
  lastName: string;

  @Column({ unique: true })
  @IsEmail()
  email: string;

  @Column({ nullable: true })
  @IsString()
  password: string;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  @IsDate()
  lastLogin: Date;

  @Column({ default: false })
  @IsBoolean()
  verified: boolean;

  @Column({ length: 500, nullable: true })
  @IsString()
  bio: string;

  @Column({ nullable: true })
  @IsString()
  avatar: string;

  @OneToMany(() => Role, (role) => role.user, { eager: true })
  roles: Role[];

  // ===== Inverse side Relation =====

  @OneToMany(() => List, (list) => list.owner)
  saveLists: List[];

  @OneToMany(() => Room, (room) => room.host)
  rooms: Room[];

  @ManyToMany(() => Reservation, (reservation) => reservation.guests)
  reservations: Reservation[];

  @OneToMany(() => Review, (review) => review.guest)
  reviews: Review[];

  @ManyToMany(() => Conversation, (conversation) => conversation.participants)
  conversations: Conversation[];

  @OneToMany(() => Message, (message) => message.sender)
  messages: Message[];

  @OneToMany(() => Payment, (payment) => payment.user)
  payments: Payment[];

  @OneToMany(() => Oauth, (oauth) => oauth.user)
  oauth: Oauth[];

  // ===== Method =====
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}
