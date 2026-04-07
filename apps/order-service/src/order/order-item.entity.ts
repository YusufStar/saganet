import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '@saganet/db';
import { OrderEntity } from './order.entity';

@Entity('order_items')
export class OrderItemEntity extends BaseEntity {
  @Column({ type: 'uuid' })
  orderId: string;

  @ManyToOne(() => OrderEntity, (order) => order.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'orderId' })
  order: OrderEntity;

  @Column({ type: 'uuid' })
  productId: string;

  @Column({ length: 500 })
  productName: string;

  @Column({ type: 'integer' })
  quantity: number;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  unitPrice: string;
}
