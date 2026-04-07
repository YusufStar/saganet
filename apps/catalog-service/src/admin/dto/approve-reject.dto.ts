import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RejectProductDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Product description is too vague' })
  reason: string;
}
