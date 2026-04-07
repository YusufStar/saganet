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
  @ApiOperation({ summary: 'Create a new user account' })
  @ApiCreatedResponse({
    type: RegisterResponseDto,
    description: 'Account created. Verification email sent via outbox relay.',
  })
  @ApiConflictResponse({ description: 'Email address is already in use' })
  @ApiBadRequestResponse({ description: 'Validation error' })
  async register(@Body() dto: RegisterDto): Promise<RegisterResponseDto> {
    return this.authService.register(dto);
  }
}
