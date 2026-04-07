import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

export class AdminCreateCategoryDto {
  @ApiProperty({ example: 'Elektronik' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({ example: 'elektronik', description: 'Auto-generated if not provided' })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiPropertyOptional({ example: 'parent-uuid', description: 'Parent category ID for subcategories' })
  @IsOptional()
  @IsUUID()
  parentId?: string;
}
