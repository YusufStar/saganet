import { ApiProperty } from '@nestjs/swagger';

class UserDto {
  @ApiProperty() id: string;
  @ApiProperty() email: string;
  @ApiProperty() role: string;
}

export class LoginResponseDto {
  @ApiProperty({ description: 'JWT access token (15 min)' })
  access_token: string;

  @ApiProperty()
  user: UserDto;
}
