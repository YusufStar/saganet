import { ApiProperty } from '@nestjs/swagger';

export class InventoryResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() productId: string;
  @ApiProperty() quantity: number;
  @ApiProperty() reserved: number;
  @ApiProperty() available: number;
  @ApiProperty() version: number;
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;
}
