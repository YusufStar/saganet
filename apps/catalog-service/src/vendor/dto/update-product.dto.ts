import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNumberString,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
} from 'class-validator';

// Intentionally NOT extending PartialType(CreateProductDto) to be explicit:
// vendorId, status, and rejectionReason are forbidden fields — they must never
// appear here, not even as optional. WhiteList + forbidNonWhitelisted in the
// ValidationPipe enforces this at runtime.
export class UpdateProductDto {
  @ApiPropertyOptional({ example: 'Akıllı Telefon Pro' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @ApiPropertyOptional({ example: 'Güncellenmiş açıklama.' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: '1499.99' })
  @IsOptional()
  @IsNumberString({}, { message: 'price must be a valid decimal number' })
  @Matches(/^\d+(\.\d{1,2})?$/, { message: 'price must be positive with up to 2 decimal places' })
  price?: string;

  @ApiPropertyOptional({ example: 'uuid' })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiPropertyOptional({ example: 'akilli-telefon-pro' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  slug?: string;
}
