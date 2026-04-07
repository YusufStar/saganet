import { Body, Controller, Get, HttpCode, HttpStatus, Post, Query } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { RegisterResponseDto } from './dto/register-response.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new user account' })
  @ApiCreatedResponse({
    type: RegisterResponseDto,
    description: 'Account created. Verification email queued via outbox relay.',
  })
  @ApiConflictResponse({ description: 'Email address is already in use' })
  @ApiBadRequestResponse({ description: 'Validation error' })
  async register(@Body() dto: RegisterDto): Promise<RegisterResponseDto> {
    return this.authService.register(dto);
  }

  @Get('verify-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify email address via one-time token' })
  @ApiOkResponse({ description: 'Email verified. Welcome email queued.' })
  @ApiBadRequestResponse({ description: 'Invalid, expired, or already-used token' })
  async verifyEmail(@Query() dto: VerifyEmailDto): Promise<{ message: string }> {
    return this.authService.verifyEmail(dto.token);
  }
}
