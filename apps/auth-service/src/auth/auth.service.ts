import { BadRequestException, ConflictException, Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DataSource } from 'typeorm';
import { randomUUID } from 'crypto';
import { createHash } from 'crypto';
import * as bcrypt from 'bcrypt';
import { DATA_SOURCE, OutboxEntity } from '@saganet/db';
import { REDIS_CLIENT, RedisClient } from '@saganet/redis';
import { KAFKA_TOPICS } from '@saganet/common';
import { UserEntity } from '../users/user.entity';
import { UserRole } from '../users/user-role.enum';
import { RegisterDto } from './dto/register.dto';
import { RegisterResponseDto } from './dto/register-response.dto';

function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

@Injectable()
export class AuthService {
  constructor(
    @Inject(DATA_SOURCE) private readonly dataSource: DataSource,
    @Inject(REDIS_CLIENT) private readonly redis: RedisClient,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<RegisterResponseDto> {
    const userRepo = this.dataSource.getRepository(UserEntity);
    const existing = await userRepo.findOne({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException('Email address is already in use');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    // One-time verification token — raw goes to outbox for notification-service
    const verificationToken = randomUUID();
    const verificationTokenHash = sha256(verificationToken);
    const verificationTokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    let user: UserEntity;
    try {
      user = await queryRunner.manager.save(UserEntity, {
        email: dto.email,
        passwordHash,
        role: UserRole.CUSTOMER,
        emailVerified: false,
        verificationTokenHash,
        verificationTokenExpiresAt,
      });

      // Outbox → notification-service sends the verify-email link
      await queryRunner.manager.save(OutboxEntity, {
        topic: KAFKA_TOPICS.USER_REGISTERED,
        payload: { userId: user.id, email: user.email, role: user.role, verificationToken },
      });

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }

    return {
      user: { id: user.id, email: user.email, role: user.role },
      message: 'Registration successful. Please check your email to verify your account.',
    };
  }

  async verifyEmail(token: string): Promise<{ message: string }> {
    const tokenHash = sha256(token);
    const userRepo = this.dataSource.getRepository(UserEntity);

    const user = await userRepo.findOne({ where: { verificationTokenHash: tokenHash } });

    if (!user) {
      throw new BadRequestException('Invalid or expired verification token');
    }
    if (user.emailVerified) {
      throw new BadRequestException('Email address is already verified');
    }
    if (user.verificationTokenExpiresAt && user.verificationTokenExpiresAt < new Date()) {
      throw new BadRequestException('Verification token has expired');
    }

    // Atomic: mark verified + queue welcome email via outbox
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.update(UserEntity, user.id, {
        emailVerified: true,
        verificationTokenHash: null,
        verificationTokenExpiresAt: null,
      });

      await queryRunner.manager.save(OutboxEntity, {
        topic: KAFKA_TOPICS.USER_EMAIL_VERIFIED,
        payload: { userId: user.id, email: user.email },
      });

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }

    return { message: 'Email verified successfully. Welcome to Saganet!' };
  }

  // Session creation (session_id + refresh_token + access_token) — implemented in login()
}
