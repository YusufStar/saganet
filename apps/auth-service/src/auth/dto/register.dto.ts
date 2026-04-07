import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Matches, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail({}, { message: 'Geçerli bir e-posta adresi giriniz' })
  email: string;

  @ApiProperty({ example: 'Secure123!', minLength: 8 })
  @IsString()
  @MinLength(8, { message: 'Şifre en az 8 karakter olmalıdır' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, {
    message: 'Şifre en az bir büyük harf, bir küçük harf ve bir rakam içermelidir',
  })
  password: string;
}
