import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ReviewResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() productId: string;
  @ApiProperty() userId: string;
  @ApiProperty() orderId: string;
  @ApiProperty({ minimum: 1, maximum: 5 }) rating: number;
  @ApiPropertyOptional() comment?: string;
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;
}

export class ReviewStatsDto {
  @ApiProperty() avgRating: number;
  @ApiProperty() reviewCount: number;
  @ApiProperty({ type: Object, example: { 1: 2, 2: 3, 3: 5, 4: 10, 5: 30 } })
  distribution: Record<number, number>;
}
