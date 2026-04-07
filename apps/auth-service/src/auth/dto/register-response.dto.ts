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
  @ApiProperty({ type: AuthUserDto })
  user: AuthUserDto;

  @ApiProperty({ example: 'Registration successful. Please check your email to verify your account.' })
  message: string;
}
