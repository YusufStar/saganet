import { Column, Entity, Index, ManyToOne, JoinColumn, Check } from 'typeorm';
import { BaseEntity } from '@saganet/db';
import { ProductEntity } from '../product/product.entity';

@Entity('reviews')
@Check(`"rating" >= 1 AND "rating" <= 5`)
export class ReviewEntity extends BaseEntity {
  @Index()
  @Column({ type: 'uuid' })
  productId: string;

  // No FK — user lives in auth-service (separate DB)
  @Index()
  @Column({ type: 'uuid' })
  userId: string;

  // orderId proves the user actually purchased — verified via Kafka event
  @Column({ type: 'uuid' })
  orderId: string;

  @Column({ type: 'smallint' })
  rating: number; // 1–5

  @Column({ type: 'text', nullable: true })
  comment?: string;

  @ManyToOne(() => ProductEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'productId' })
  product: ProductEntity;
}
