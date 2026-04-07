import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'Yusuf Yıldız' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  displayName?: string;
}
