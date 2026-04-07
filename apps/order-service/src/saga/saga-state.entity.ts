import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '@saganet/db';

export enum SagaStep {
  STARTED = 'STARTED',
  INVENTORY_RESERVE_SENT = 'INVENTORY_RESERVE_SENT',
  INVENTORY_RESERVED = 'INVENTORY_RESERVED',
  PAYMENT_CHARGE_SENT = 'PAYMENT_CHARGE_SENT',
  PAYMENT_COMPLETED = 'PAYMENT_COMPLETED',
  COMPLETED = 'COMPLETED',
  COMPENSATING = 'COMPENSATING',
  FAILED = 'FAILED',
}

export enum SagaStatus {
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

@Entity('saga_states')
export class SagaStateEntity extends BaseEntity {
  @Index({ unique: true })
  @Column({ type: 'uuid' })
  orderId: string;

  @Column({ type: 'enum', enum: SagaStep, default: SagaStep.STARTED })
  step: SagaStep;

  @Column({ type: 'enum', enum: SagaStatus, default: SagaStatus.RUNNING })
  status: SagaStatus;

  @Column({ type: 'jsonb', nullable: true })
  payload?: Record<string, unknown>;

  @Column({ type: 'timestamp', nullable: true })
  timeoutAt?: Date;
}
