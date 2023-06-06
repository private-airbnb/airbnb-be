import { CoreEntity } from './core.entity';
import { User } from '../../users/entities/user.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { Conversation } from './conversation.entity';

@Entity()
export class Message extends CoreEntity {
  @Column({ type: 'text' })
  content: string;

  @ManyToOne(() => User, (user) => user.messages)
  sender: User;

  @ManyToOne(() => Conversation, (conversation) => conversation.messages)
  conversation: Conversation;
}
