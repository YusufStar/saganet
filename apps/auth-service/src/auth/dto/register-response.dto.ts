import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../users/user-role.enum';

class AuthUserDto {
  @ApiProperty({ example: 'uuid-v4' })
  id: string;

  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @ApiProperty({ enum: UserRole, example: UserRole.CUSTOMER })
  role: UserRole;
}

export class RegisterResponseDto {
  @ApiProperty({ description: 'JWT access token (~15 dakika geçerli)' })
  accessToken: string;

  @ApiProperty({ type: AuthUserDto })
  user: AuthUserDto;
}
