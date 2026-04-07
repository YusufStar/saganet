import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('outbox')
export class OutboxEntity extends BaseEntity {
  @Column()
  topic: string;

  @Column('jsonb')
  payload: Record<string, unknown>;

  @Index()
  @Column({ type: 'timestamp', nullable: true })
  sentAt?: Date;

  @Column({ default: 0 })
  retryCount: number;
}
