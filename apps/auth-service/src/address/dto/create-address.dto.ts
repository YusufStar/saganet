import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateAddressDto {
  @ApiPropertyOptional({ example: 'Ev' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  label?: string;

  @ApiProperty({ example: 'Yusuf Yıldız' })
  @IsString()
  @MaxLength(100)
  fullName: string;

  @ApiPropertyOptional({ example: '+90 555 000 0000' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @ApiProperty({ example: 'Atatürk Cad. No:1 Daire:2' })
  @IsString()
  @MaxLength(255)
  street: string;

  @ApiPropertyOptional({ example: 'Kadıköy' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  district?: string;

  @ApiProperty({ example: 'İstanbul' })
  @IsString()
  @MaxLength(100)
  city: string;

  @ApiPropertyOptional({ example: '34710' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  postalCode?: string;

  @ApiPropertyOptional({ example: 'Türkiye', default: 'Türkiye' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  country?: string;

  @ApiPropertyOptional({ example: false, default: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
