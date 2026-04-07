import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '@saganet/db';

@Entity('inventory')
export class InventoryEntity extends BaseEntity {
  @Index({ unique: true })
  @Column({ type: 'uuid' })
  productId: string;

  // Total stock quantity
  @Column({ type: 'integer', default: 0 })
  quantity: number;

  // Currently reserved (locked by pending orders)
  @Column({ type: 'integer', default: 0 })
  reserved: number;

  // Computed: quantity - reserved (but stored for query performance)
  @Column({ type: 'integer', default: 0 })
  available: number;

  // Optimistic lock version column — incremented on every update
  @Column({ type: 'integer', default: 0 })
  version: number;
}
