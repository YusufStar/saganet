import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsPositive, IsString, IsUUID, MaxLength, Min, ValidateNested, IsNumber, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class OrderItemDto {
  @ApiProperty({ example: 'uuid-product-id' })
  @IsUUID()
  productId: string;

  @ApiProperty({ example: 'Widget Pro' })
  @IsString() @IsNotEmpty() @MaxLength(500)
  productName: string;

  @ApiProperty({ example: 2 })
  @IsInt() @Min(1)
  quantity: number;

  @ApiProperty({ example: '29.99', description: 'Unit price as string (NUMERIC precision)' })
  @IsString() @IsNotEmpty()
  unitPrice: string;
}

export class AddressSnapshotDto {
  @ApiProperty() @IsString() @IsNotEmpty() @MaxLength(200) fullName: string;
  @ApiProperty() @IsString() @IsNotEmpty() @MaxLength(30)  phone: string;
  @ApiProperty() @IsString() @IsNotEmpty() @MaxLength(500) street: string;
  @ApiProperty({ required: false }) @IsString() @MaxLength(200) district?: string;
  @ApiProperty() @IsString() @IsNotEmpty() @MaxLength(200) city: string;
  @ApiProperty({ required: false }) @IsString() @MaxLength(20) postalCode?: string;
  @ApiProperty() @IsString() @IsNotEmpty() @MaxLength(100) country: string;
}

export class CreateOrderDto {
  @ApiProperty({ type: [OrderItemDto] })
  @IsArray() @ValidateNested({ each: true }) @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @ApiProperty({ type: AddressSnapshotDto })
  @ValidateNested() @Type(() => AddressSnapshotDto)
  address: AddressSnapshotDto;
}
