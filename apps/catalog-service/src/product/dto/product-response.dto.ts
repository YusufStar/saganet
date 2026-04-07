import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProductImageResponseDto } from './product-image-response.dto';

export class ProductResponseDto {
  @ApiProperty({ example: 'uuid' })
  id: string;

  @ApiProperty({ example: 'uuid' })
  vendorId: string;

  @ApiProperty({ example: 'Akıllı Telefon' })
  name: string;

  @ApiPropertyOptional({ example: 'Yüksek performanslı akıllı telefon.' })
  description?: string;

  @ApiProperty({ example: 'akilli-telefon-3f9a1b' })
  slug: string;

  @ApiProperty({ example: '1299.99' })
  price: string;

  @ApiProperty({ example: 'uuid' })
  categoryId: string;

  @ApiProperty({ type: [ProductImageResponseDto] })
  images: ProductImageResponseDto[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
