import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, IsUUID, Max, MaxLength, Min } from 'class-validator';

export class CreateReviewDto {
  @ApiProperty({ example: 5, minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiPropertyOptional({ example: 'Harika bir ürün, çok memnun kaldım.' })
  @IsString()
  @IsOptional()
  @MaxLength(2000)
  comment?: string;

  @ApiProperty({ description: 'Order ID proving purchase', example: 'uuid' })
  @IsUUID()
  orderId: string;
}
