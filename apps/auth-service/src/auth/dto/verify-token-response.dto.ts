import { ApiProperty } from '@nestjs/swagger';

export class VerifyTokenResponseDto {
  @ApiProperty() userId: string;
  @ApiProperty() role: string;
  @ApiProperty() sessionId: string;
}
