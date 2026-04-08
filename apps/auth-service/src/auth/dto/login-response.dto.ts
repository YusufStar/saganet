import { ApiProperty } from '@nestjs/swagger';

class UserDto {
  @ApiProperty() id: string;
  @ApiProperty() email: string;
  @ApiProperty() role: string;
}

export class LoginResponseDto {
  @ApiProperty()
  user: UserDto;
}
