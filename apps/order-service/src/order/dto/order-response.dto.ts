import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus } from '../order-status.enum';

export class OrderItemResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() productId: string;
  @ApiProperty() productName: string;
  @ApiProperty() quantity: number;
  @ApiProperty() unitPrice: string;
}

export class OrderResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() userId: string;
  @ApiProperty({ enum: OrderStatus }) status: OrderStatus;
  @ApiProperty() totalAmount: string;
  @ApiProperty() addressSnapshot: Record<string, unknown>;
  @ApiProperty({ type: [OrderItemResponseDto] }) items: OrderItemResponseDto[];
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;
}
