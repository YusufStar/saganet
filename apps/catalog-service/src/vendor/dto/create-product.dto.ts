import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductDto {
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
}
