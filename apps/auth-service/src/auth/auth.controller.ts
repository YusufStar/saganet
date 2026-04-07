import { Body, Controller, HttpCode, HttpStatus, Post, Req, Res } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { RegisterResponseDto } from './dto/register-response.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Yeni kullanıcı kaydı oluştur' })
  @ApiCreatedResponse({ type: RegisterResponseDto, description: 'Kayıt başarılı, access token ve session cookie döner' })
  @ApiConflictResponse({ description: 'E-posta zaten kullanılıyor' })
  @ApiBadRequestResponse({ description: 'Validation hatası' })
  async register(
    @Body() dto: RegisterDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<RegisterResponseDto> {
    const { sessionId, ...response } = await this.authService.register(dto, {
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip,
    });

    const isProd = process.env.NODE_ENV === 'production';
    res.cookie('session_id', sessionId, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'strict' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });

    return response;
  }
}
