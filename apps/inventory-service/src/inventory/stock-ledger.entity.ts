import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '@saganet/db';

export enum LedgerType {
  RESTOCK = 'RESTOCK',   // Admin adds stock
  RESERVE = 'RESERVE',   // Order reserves stock
  RELEASE = 'RELEASE',   // Compensation releases reserved stock
  ADJUST = 'ADJUST',     // Manual adjustment
}

@Entity('stock_ledger')
export class StockLedgerEntity extends BaseEntity {
  @Index()
  @Column({ type: 'uuid' })
  productId: string;

  @Column({ type: 'enum', enum: LedgerType })
  type: LedgerType;

  // Positive = add stock, Negative = remove stock
  @Column({ type: 'integer' })
  delta: number;

  // orderId for RESERVE/RELEASE — used for idempotency
  @Index()
  @Column({ type: 'uuid', nullable: true })
  referenceId?: string;
}
