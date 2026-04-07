import { ApiProperty } from '@nestjs/swagger';
import { ImageType } from '../image-type.enum';

export class ProductImageResponseDto {
  @ApiProperty({ example: 'uuid' })
  id: string;

  @ApiProperty({ example: 'https://cdn.example.com/images/product.jpg' })
  url: string;

  @ApiProperty({ enum: ImageType, example: ImageType.FULL })
  type: ImageType;

  @ApiProperty({ example: 0 })
  displayOrder: number;
}
