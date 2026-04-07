import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '@saganet/db';
import { PaymentStatus } from './payment-status.enum';

@Entity('payments')
export class PaymentEntity extends BaseEntity {
  @Index({ unique: true })
  @Column({ type: 'uuid' })
  orderId: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  amount: string;

  @Column({ length: 3, default: 'TRY' })
  currency: string;

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
  status: PaymentStatus;

  @Column({ length: 50, default: 'mock' })
  provider: string;

  // Last 4 digits only — PCI safe
  @Column({ length: 4, nullable: true })
  cardLast4?: string;

  @Column({ nullable: true })
  failureReason?: string;
}
