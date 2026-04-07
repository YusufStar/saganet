import { Column, Entity, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '@saganet/db';
import { ProductEntity } from './product.entity';
import { ImageType } from './image-type.enum';

@Entity('product_images')
export class ProductImageEntity extends BaseEntity {
  @Index()
  @Column({ type: 'uuid' })
  productId: string;

  @ManyToOne(() => ProductEntity, (product) => product.images, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'productId' })
  product: ProductEntity;

  @Column({ length: 2048 })
  url: string;

  @Column({ type: 'enum', enum: ImageType, default: ImageType.FULL })
  type: ImageType;

  // Display order within a product's image list
  @Column({ type: 'smallint', default: 0 })
  displayOrder: number;
}
