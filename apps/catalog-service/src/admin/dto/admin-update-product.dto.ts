import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { AdminCreateProductDto } from './admin-create-product.dto';

export class AdminUpdateProductDto extends PartialType(AdminCreateProductDto) {
  @ApiPropertyOptional({ example: 'Product description is too vague' })
  @IsOptional()
  @IsString()
  rejectionReason?: string;
}
