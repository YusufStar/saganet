import { IsInt, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AdjustInventoryDto {
  @ApiProperty({ description: 'Positive to add, negative to remove' })
  @IsInt()
  delta: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  reason?: string;
}
