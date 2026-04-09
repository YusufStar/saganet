import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { RegisterResponseDto } from './dto/register-response.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { VerifyTokenResponseDto } from './dto/verify-token-response.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
};

/** Short-lived access token cookie — read by Next.js Proxy for route guards */
const ACCESS_TOKEN_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 15 * 60 * 1000, // 15 minutes in ms (Express maxAge is milliseconds)
  path: '/',
};

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new user account' })
  @ApiCreatedResponse({ type: RegisterResponseDto, description: 'Account created. Verification email queued.' })
  @ApiConflictResponse({ description: 'Email address is already in use' })
  @ApiBadRequestResponse({ description: 'Validation error' })
  async register(@Body() dto: RegisterDto): Promise<RegisterResponseDto> {
    return this.authService.register(dto);
  }

  @Get('verify-email')
  @ApiOperation({ summary: 'Verify email address via one-time token' })
  @ApiOkResponse({ description: 'Email verified. Redirects to frontend.' })
  @ApiBadRequestResponse({ description: 'Invalid, expired, or already-used token' })
  async verifyEmail(
    @Query() dto: VerifyEmailDto,
    @Res() res: Response,
  ): Promise<void> {
    const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:3333';

    try {
      await this.authService.verifyEmail(dto.token);
      res.redirect(`${frontendUrl}/login?verified=true`);
    } catch {
      res.redirect(`${frontendUrl}/login?verified=false`);
    }
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sign in and receive access token + session cookies' })
  @ApiOkResponse({ type: LoginResponseDto })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials or rate limited' })
  @ApiForbiddenResponse({ description: 'Email not verified' })
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<LoginResponseDto> {
    const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ?? req.ip ?? '';
    const userAgent = req.headers['user-agent'] ?? '';

    const { sessionId, rawRefreshToken, access_token, ...response } = await this.authService.login(dto, ip, userAgent);

    res.cookie('session_id', sessionId, COOKIE_OPTIONS);
    res.cookie('refresh_token', rawRefreshToken, COOKIE_OPTIONS);
    res.cookie('sat', access_token, ACCESS_TOKEN_COOKIE_OPTIONS);

    return response;
  }

  @Post('refresh')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiCookieAuth('session_id')
  @ApiCookieAuth('refresh_token')
  @ApiOperation({ summary: 'Rotate refresh token and get a new access token' })
  @ApiOkResponse({ description: 'New access token returned. Refresh token cookie updated.' })
  @ApiUnauthorizedResponse({ description: 'Session expired, invalid, or token reuse detected' })
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    const sessionId = req.cookies?.['session_id'];
    const rawRefreshToken = req.cookies?.['refresh_token'];
    const userAgent = req.headers['user-agent'] ?? '';

    if (!sessionId || !rawRefreshToken) {
      throw new Error('Missing session cookies');
    }

    const { access_token, rawRefreshToken: newRefreshToken } =
      await this.authService.refresh(sessionId, rawRefreshToken, userAgent);

    res.cookie('refresh_token', newRefreshToken, COOKIE_OPTIONS);
    res.cookie('sat', access_token, ACCESS_TOKEN_COOKIE_OPTIONS);
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiCookieAuth('session_id')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Sign out from the current device' })
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    const sessionId = req.cookies?.['session_id'] ?? req.headers['x-session-id'];
    if (sessionId) {
      await this.authService.logout(sessionId as string);
    }
    res.clearCookie('session_id');
    res.clearCookie('refresh_token');
    res.clearCookie('sat');
  }

  @Post('logout/all')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Sign out from all devices' })
  async logoutAll(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    const userId = req.headers['x-user-id'] as string;
    if (userId) {
      await this.authService.logoutAll(userId);
    }
    res.clearCookie('session_id');
    res.clearCookie('refresh_token');
    res.clearCookie('sat');
  }

  @Post('verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify access token and session (used by api-gateway)' })
  @ApiOkResponse({ type: VerifyTokenResponseDto })
  @ApiUnauthorizedResponse({ description: 'Invalid token or session' })
  async verifyToken(@Req() req: Request): Promise<VerifyTokenResponseDto> {
    const authHeader = req.headers['authorization'] ?? '';
    const accessToken = authHeader.replace(/^Bearer\s+/i, '');
    const sessionId = req.cookies?.['session_id'] ?? (req.headers['x-session-id'] as string);

    if (!accessToken || !sessionId) {
      throw new Error('Missing access token or session id');
    }

    return this.authService.verifyToken(sessionId, accessToken);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request a password reset link' })
  @ApiOkResponse({ description: 'If that email exists, a reset link has been sent.' })
  async forgotPassword(@Body() dto: ForgotPasswordDto): Promise<{ message: string }> {
    return this.authService.forgotPassword(dto.email);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password using a reset token' })
  @ApiOkResponse({ description: 'Password has been reset successfully.' })
  @ApiBadRequestResponse({ description: 'Invalid or expired reset token' })
  async resetPassword(@Body() dto: ResetPasswordDto): Promise<{ message: string }> {
    return this.authService.resetPassword(dto.token, dto.newPassword);
  }
}
