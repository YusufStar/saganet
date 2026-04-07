import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CategoryResponseDto {
  @ApiProperty({ example: 'uuid' })
  id: string;

  @ApiProperty({ example: 'Elektronik' })
  name: string;

  @ApiProperty({ example: 'elektronik' })
  slug: string;

  @ApiPropertyOptional({ example: 'uuid', description: 'Parent category ID (null for root)' })
  parentId?: string;

  @ApiProperty({ type: () => [CategoryResponseDto] })
  children: CategoryResponseDto[];
}
