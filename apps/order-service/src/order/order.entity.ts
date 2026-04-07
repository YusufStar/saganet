import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from '@saganet/db';
import { OrderStatus } from './order-status.enum';
import { OrderItemEntity } from './order-item.entity';

@Entity('orders')
export class OrderEntity extends BaseEntity {
  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
  status: OrderStatus;

  @Column({ type: 'jsonb' })
  addressSnapshot: {
    fullName: string;
    phone: string;
    street: string;
    district?: string;
    city: string;
    postalCode?: string;
    country: string;
  };

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  totalAmount: string;

  @Column({ length: 128, nullable: true })
  idempotencyKey?: string;

  @OneToMany(() => OrderItemEntity, (item) => item.order, { cascade: true })
  items: OrderItemEntity[];
}
