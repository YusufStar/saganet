import {
  Column,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { BaseEntity } from '@saganet/db';
import { CategoryEntity } from '../category/category.entity';
import { ProductImageEntity } from './product-image.entity';
import { ProductStatus } from './product-status.enum';

@Entity('products')
export class ProductEntity extends BaseEntity {
  // No FK constraint — vendorId references users in auth-service (separate DB)
  @Index()
  @Column({ type: 'uuid' })
  vendorId: string;

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Index({ unique: true })
  @Column({ length: 255 })
  slug: string;

  // NUMERIC(12,2) — exact decimal, no floating point errors
  @Column({ type: 'numeric', precision: 12, scale: 2 })
  price: string;

  @Index()
  @Column({ type: 'uuid' })
  categoryId: string;

  @ManyToOne(() => CategoryEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'categoryId' })
  category: CategoryEntity;

  @Index()
  @Column({ type: 'enum', enum: ProductStatus, default: ProductStatus.PENDING_REVIEW })
  status: ProductStatus;

  // Populated by ADMIN on rejection — required when status → REJECTED
  @Column({ type: 'text', nullable: true })
  rejectionReason?: string;

  @OneToMany(() => ProductImageEntity, (image) => image.product, {
    cascade: ['insert', 'update'],
  })
  images: ProductImageEntity[];
}
