import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID } from 'class-validator';

export class VerifyEmailDto {
  @ApiProperty({ description: 'One-time verification token from the email link', example: 'uuid-v4' })
  @IsString()
  @IsUUID()
  token: string;
}
