import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class RejectVendorApplicationDto {
  @ApiPropertyOptional({ example: 'Eksik belge' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  reason?: string;
}
