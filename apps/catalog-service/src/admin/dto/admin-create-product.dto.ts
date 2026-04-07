import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
} from 'class-validator';
import { ProductStatus } from '../../product/product-status.enum';

export class AdminCreateProductDto {
  @ApiProperty({ example: 'Akıllı Telefon' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({ example: 'Yüksek performanslı akıllı telefon.' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: '1299.99', description: 'Positive decimal price' })
  @IsNumberString({}, { message: 'price must be a valid decimal number' })
  @Matches(/^\d+(\.\d{1,2})?$/, { message: 'price must be positive with up to 2 decimal places' })
  price: string;

  @ApiProperty({ example: 'uuid' })
  @IsUUID()
  categoryId: string;

  @ApiPropertyOptional({ example: 'akilli-telefon', description: 'Auto-generated if not provided' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  slug?: string;

  @ApiProperty({ example: 'vendor-uuid', description: 'Vendor ID — admin sets explicitly' })
  @IsUUID()
  vendorId: string;

  @ApiPropertyOptional({
    enum: ProductStatus,
    example: ProductStatus.ACTIVE,
    description: 'Defaults to ACTIVE if not provided',
  })
  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;
}
