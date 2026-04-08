import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DataSource } from 'typeorm';
import { randomUUID } from 'crypto';
import { createHash } from 'crypto';
import * as bcrypt from 'bcrypt';
import { DATA_SOURCE, OutboxEntity } from '@saganet/db';
import { REDIS_CLIENT, RedisClient } from '@saganet/redis';
import { KAFKA_TOPICS } from '@saganet/common';
import { UserEntity } from '../users/user.entity';
import { UserSessionEntity } from '../users/user-session.entity';
import { UserRole } from '../users/user-role.enum';
import { RegisterDto } from './dto/register.dto';
import { RegisterResponseDto } from './dto/register-response.dto';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { RateLimiterService } from './rate-limiter.service';
import { logger } from '@saganet/observability';

function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

// How many failed attempts before lockout, and how long the lockout lasts
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 min
const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days

@Injectable()
export class AuthService {
  constructor(
    @Inject(DATA_SOURCE) private readonly dataSource: DataSource,
    @Inject(REDIS_CLIENT) private readonly redis: RedisClient,
    private readonly jwtService: JwtService,
    private readonly rateLimiter: RateLimiterService,
  ) {}

  async register(dto: RegisterDto): Promise<RegisterResponseDto> {
    const userRepo = this.dataSource.getRepository(UserEntity);
    const existing = await userRepo.findOne({ where: { email: dto.email } });
    if (existing) {
      // Prevent email enumeration — silently return success
      return {
        user: { id: existing.id, email: existing.email, role: existing.role },
        message: 'If this email is not yet registered, a verification email has been sent.',
      };
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

  async login(dto: LoginDto, ip: string, userAgent: string, ): Promise<LoginResponseDto & { access_token: string; sessionId: string; rawRefreshToken: string }> {
    // 1. Rate limit check
    const rl = await this.rateLimiter.checkLoginRateLimit(ip, dto.email);
    if (!rl.allowed) {
      throw new UnauthorizedException(
        `Too many login attempts. Try again in ${Math.ceil(rl.retryAfterSeconds / 60)} minute(s).`,
      );
    }

    const userRepo = this.dataSource.getRepository(UserEntity);
    const user = await userRepo.findOne({ where: { email: dto.email } });

    // 2. User not found — generic message to prevent email enumeration
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // 3. OAuth-only account
    if (!user.passwordHash) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // 4. Account lockout check
    if (
      user.failedLoginAttempts >= MAX_FAILED_ATTEMPTS &&
      user.lastFailedLoginAt &&
      Date.now() - user.lastFailedLoginAt.getTime() < LOCKOUT_DURATION_MS
    ) {
      logger.warn({ event: 'login.locked', email: dto.email, ip });
      const retryAfterMs = LOCKOUT_DURATION_MS - (Date.now() - user.lastFailedLoginAt.getTime());
      throw new UnauthorizedException(
        `Account temporarily locked. Try again in ${Math.ceil(retryAfterMs / 60000)} minute(s).`,
      );
    }

    // 5. Password check
    const passwordMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordMatch) {
      logger.warn({ event: 'login.failure', email: dto.email, ip, reason: 'invalid_password' });
      await userRepo.update(user.id, {
        failedLoginAttempts: user.failedLoginAttempts + 1,
        lastFailedLoginAt: new Date(),
      });
      throw new UnauthorizedException('Invalid email or password');
    }

    // 6. Email verified check
    if (!user.emailVerified) {
      throw new ForbiddenException('Please verify your email address before signing in.');
    }

    // 7. Reset lockout counters on successful auth
    await userRepo.update(user.id, { failedLoginAttempts: 0, lastFailedLoginAt: null as any });
    await this.rateLimiter.onLoginSuccess(dto.email);
    logger.info({ event: 'login.success', userId: user.id, ip });

    // 8. Create session
    const rawRefreshToken = randomUUID();
    const refreshTokenHash = await bcrypt.hash(rawRefreshToken, 10);
    const familyId = randomUUID();
    const expiresAt = new Date(Date.now() + SESSION_TTL_SECONDS * 1000);

    const sessionRepo = this.dataSource.getRepository(UserSessionEntity);
    const session = await sessionRepo.save({
      userId: user.id,
      refreshTokenHash,
      familyId,
      userAgent: userAgent?.slice(0, 512) ?? null,
      ipAddress: ip?.slice(0, 64) ?? null,
      lastActiveAt: new Date(),
      expiresAt,
    });

    // 9. Write to Redis
    const redisKey = `session:${session.id}`;
    await this.redis.set(
      redisKey,
      JSON.stringify({ userId: user.id, role: user.role, sessionId: session.id, userAgent }),
      'EX',
      SESSION_TTL_SECONDS,
    );
    await this.redis.sadd(`user:${user.id}:sessions`, session.id);
    await this.redis.expire(`user:${user.id}:sessions`, SESSION_TTL_SECONDS);

    // 10. Sign access token
    const access_token = this.jwtService.sign({
      sub: user.id,
      role: user.role,
      sessionId: session.id,
    });

    return {
      access_token,
      user: { id: user.id, email: user.email, role: user.role },
      sessionId: session.id,
      rawRefreshToken,
    };
  }

  async refresh(sessionId: string, rawRefreshToken: string, userAgent: string): Promise<{ access_token: string; rawRefreshToken: string }> {
    // 1. Redis check (fast path)
    const cached = await this.redis.get(`session:${sessionId}`);
    if (!cached) throw new UnauthorizedException('Session expired or not found');

    const { userAgent: savedAgent } = JSON.parse(cached);

    // 2. Device fingerprint check
    if (savedAgent && userAgent && savedAgent !== userAgent) {
      await this.revokeSession(sessionId);
      throw new UnauthorizedException('Suspicious activity detected. Session has been revoked.');
    }

    // 3. DB check
    const sessionRepo = this.dataSource.getRepository(UserSessionEntity);
    const session = await sessionRepo.findOne({ where: { id: sessionId } });

    if (!session || session.revokedAt || session.expiresAt < new Date()) {
      throw new UnauthorizedException('Session is invalid or expired');
    }

    // 4. Refresh token verify — reuse detection
    const tokenMatch = await bcrypt.compare(rawRefreshToken, session.refreshTokenHash);
    if (!tokenMatch) {
      // Token reuse: revoke entire family
      await sessionRepo
        .createQueryBuilder()
        .update()
        .set({ revokedAt: new Date() })
        .where('familyId = :familyId AND revokedAt IS NULL', { familyId: session.familyId })
        .execute();
      throw new UnauthorizedException('Token reuse detected. All sessions in this family have been revoked.');
    }

    // 5. Rotate refresh token
    const newRawRefreshToken = randomUUID();
    const newHash = await bcrypt.hash(newRawRefreshToken, 10);
    const newExpiresAt = new Date(Date.now() + SESSION_TTL_SECONDS * 1000);

    await sessionRepo.update(session.id, {
      refreshTokenHash: newHash,
      lastActiveAt: new Date(),
      expiresAt: newExpiresAt,
    });

    // 6. Renew Redis TTL
    const userRepo = this.dataSource.getRepository(UserEntity);
    const user = await userRepo.findOne({ where: { id: session.userId } });
    if (!user) throw new NotFoundException('User not found');

    await this.redis.set(
      `session:${session.id}`,
      JSON.stringify({ userId: user.id, role: user.role, sessionId: session.id, userAgent }),
      'EX',
      SESSION_TTL_SECONDS,
    );

    const access_token = this.jwtService.sign({
      sub: user.id,
      role: user.role,
      sessionId: session.id,
    });

    return { access_token, rawRefreshToken: newRawRefreshToken };
  }

  async logout(sessionId: string): Promise<void> {
    await this.revokeSession(sessionId);
  }

  async logoutAll(userId: string): Promise<void> {
    const sessionIds = await this.redis.smembers(`user:${userId}:sessions`);

    await Promise.all(sessionIds.map((id) => this.redis.del(`session:${id}`)));
    await this.redis.del(`user:${userId}:sessions`);

    await this.dataSource
      .getRepository(UserSessionEntity)
      .createQueryBuilder()
      .update()
      .set({ revokedAt: new Date() })
      .where('userId = :userId AND revokedAt IS NULL', { userId })
      .execute();
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    const userRepo = this.dataSource.getRepository(UserEntity);
    const user = await userRepo.findOne({ where: { email } });

    if (user) {
      const resetToken = randomUUID();
      const resetTokenHash = sha256(resetToken);
      const resetTokenExpiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        await queryRunner.manager.update(UserEntity, user.id, {
          resetTokenHash,
          resetTokenExpiresAt,
        });

        await queryRunner.manager.save(OutboxEntity, {
          topic: KAFKA_TOPICS.USER_PASSWORD_RESET_REQUESTED,
          payload: { userId: user.id, email: user.email, resetToken },
        });

        await queryRunner.commitTransaction();
      } catch (err) {
        await queryRunner.rollbackTransaction();
        throw err;
      } finally {
        await queryRunner.release();
      }
    }

    return { message: 'If that email exists, a reset link has been sent.' };
  }

  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    const tokenHash = sha256(token);
    const userRepo = this.dataSource.getRepository(UserEntity);

    const user = await userRepo.findOne({ where: { resetTokenHash: tokenHash } });

    if (!user) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    if (user.resetTokenExpiresAt && user.resetTokenExpiresAt < new Date()) {
      throw new BadRequestException('Reset token has expired');
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.update(UserEntity, user.id, {
        passwordHash,
        resetTokenHash: null,
        resetTokenExpiresAt: null,
        failedLoginAttempts: 0,
      });

      await queryRunner.manager.save(OutboxEntity, {
        topic: KAFKA_TOPICS.USER_PASSWORD_CHANGED,
        payload: { userId: user.id, email: user.email },
      });

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }

    await this.logoutAll(user.id);

    return { message: 'Password has been reset successfully.' };
  }

  async verifyToken(sessionId: string, accessToken: string): Promise<{ userId: string; role: string; sessionId: string }> {
    try {
      this.jwtService.verify(accessToken);
    } catch {
      throw new UnauthorizedException('Invalid or expired access token');
    }

    const cached = await this.redis.get(`session:${sessionId}`);
    if (!cached) {
      throw new UnauthorizedException('Session expired or not found');
    }

    const { userId, role, sessionId: sid } = JSON.parse(cached);
    return { userId, role, sessionId: sid };
  }

  // ---------------------------------------------------------------------------
  // Internal helpers
  // ---------------------------------------------------------------------------

  private async revokeSession(sessionId: string): Promise<void> {
    const session = await this.dataSource
      .getRepository(UserSessionEntity)
      .findOne({ where: { id: sessionId } });

    if (session) {
      await this.dataSource.getRepository(UserSessionEntity).update(sessionId, { revokedAt: new Date() });
      await this.redis.del(`session:${sessionId}`);
      if (session.userId) {
        await this.redis.srem(`user:${session.userId}:sessions`, sessionId);
      }
    }
  }
}
