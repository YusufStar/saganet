import { Column, Entity, Index, Unique } from 'typeorm';
import { BaseEntity } from '@saganet/db';

/**
 * Populated via Kafka when an order.completed event arrives.
 * Used to verify purchase eligibility before allowing a review.
 */
@Entity('user_purchased_products')
@Unique(['userId', 'productId'])
export class UserPurchasedProductEntity extends BaseEntity {
  @Index()
  @Column({ type: 'uuid' })
  userId: string;

  @Index()
  @Column({ type: 'uuid' })
  productId: string;

  @Column({ type: 'uuid' })
  orderId: string;
}
