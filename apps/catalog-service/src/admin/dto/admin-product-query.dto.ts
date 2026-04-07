import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { ProductListQueryDto } from '../../product/dto/product-list-query.dto';
import { ProductStatus } from '../../product/product-status.enum';

export class AdminProductQueryDto extends ProductListQueryDto {
  @ApiPropertyOptional({ example: 'vendor-uuid', description: 'Filter by vendor ID' })
  @IsOptional()
  @IsUUID()
  vendorId?: string;

  @ApiPropertyOptional({ enum: ProductStatus, description: 'Filter by status' })
  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;
}
