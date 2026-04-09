import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  Length,
  Matches,
  MaxLength,
} from 'class-validator';

export class CreateVendorApplicationDto {
  // ─── Personal ─────────────────────────────────────────────────────────────

  @ApiProperty({ example: 'Yusuf' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  firstName: string;

  @ApiProperty({ example: 'Yıldız' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  lastName: string;

  @ApiProperty({ example: '12345678901', description: 'TC Kimlik No (11 digits)' })
  @IsString()
  @Length(11, 11, { message: 'Identity number must be exactly 11 digits' })
  @Matches(/^\d{11}$/, { message: 'Identity number must contain only digits' })
  identityNumber: string;

  @ApiProperty({ example: '+90 555 000 0000' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  phone: string;

  // ─── Company ──────────────────────────────────────────────────────────────

  @ApiProperty({ example: 'Saganet Teknoloji Ltd. Şti.' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  companyName: string;

  @ApiProperty({ example: 'Limited', description: 'Şahıs / Limited / Anonim' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  companyType: string;

  @ApiPropertyOptional({ example: '1234567890' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  taxNumber?: string;

  @ApiPropertyOptional({ example: 'Kadıköy Vergi Dairesi' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  taxOffice?: string;

  // ─── Address ──────────────────────────────────────────────────────────────

  @ApiProperty({ example: 'Atatürk Cad. No:1 Daire:2' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  street: string;

  @ApiPropertyOptional({ example: 'Kadıköy' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  district?: string;

  @ApiProperty({ example: 'İstanbul' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  city: string;

  @ApiPropertyOptional({ example: '34710' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  postalCode?: string;

  // ─── Bank ─────────────────────────────────────────────────────────────────

  @ApiProperty({ example: 'TR330006100519786457841326' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^TR\d{24}$/, { message: 'IBAN must be a valid Turkish IBAN (TR + 24 digits)' })
  iban: string;

  @ApiPropertyOptional({ example: 'Ziraat Bankası' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  bankName?: string;

  // ─── About ────────────────────────────────────────────────────────────────

  @ApiPropertyOptional({ example: 'Elektronik ürünler satışı yapmak istiyorum...' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  about?: string;
}
