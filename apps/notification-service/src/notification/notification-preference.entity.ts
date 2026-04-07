import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('notification_preferences')
export class NotificationPreferenceEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  channel: string;

  @Column()
  eventType: string;

  @Column({ default: true })
  enabled: boolean;

  @CreateDateColumn()
  updatedAt: Date;
}
