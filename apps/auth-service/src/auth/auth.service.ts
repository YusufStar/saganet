import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DataSource } from 'typeorm';
import { randomUUID } from 'crypto';
import * as bcrypt from 'bcrypt';
import { DATA_SOURCE, OutboxEntity } from '@saganet/db';
import { REDIS_CLIENT, RedisClient } from '@saganet/redis';
import { KAFKA_TOPICS } from '@saganet/common';
import { UserEntity } from '../users/user.entity';
import { UserSessionEntity } from '../users/user-session.entity';
import { UserRole } from '../users/user-role.enum';
import { RegisterDto } from './dto/register.dto';
import { RegisterResponseDto } from './dto/register-response.dto';

export interface RegisterMeta {
  userAgent?: string;
  ipAddress?: string;
}

@Injectable()
export class AuthService {
  constructor(
    @Inject(DATA_SOURCE) private readonly dataSource: DataSource,
    @Inject(REDIS_CLIENT) private readonly redis: RedisClient,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto, meta: RegisterMeta): Promise<RegisterResponseDto & { sessionId: string }> {
    const userRepo = this.dataSource.getRepository(UserEntity);
    const existing = await userRepo.findOne({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException('Bu e-posta adresi zaten kullanılıyor');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    // Atomik: kullanıcı + outbox event aynı transaction'da
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    let user: UserEntity;
    try {
      user = await queryRunner.manager.save(UserEntity, {
        email: dto.email,
        passwordHash,
        role: UserRole.CUSTOMER,
      });

      // Outbox → notification-service hoşgeldin + doğrulama e-postası gönderecek
      await queryRunner.manager.save(OutboxEntity, {
        topic: KAFKA_TOPICS.USER_REGISTERED,
        payload: { userId: user.id, email: user.email, role: user.role },
      });

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }

    const sessionId = await this.createSession(user, meta);

    const accessToken = this.jwtService.sign({
      sub: user.id,
      role: user.role,
      sessionId,
    });

    return {
      accessToken,
      sessionId,
      user: { id: user.id, email: user.email, role: user.role },
    };
  }

  private async createSession(user: UserEntity, meta: RegisterMeta): Promise<string> {
    const refreshTokenHash = await bcrypt.hash(randomUUID(), 10);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const sessionRepo = this.dataSource.getRepository(UserSessionEntity);
    const session = await sessionRepo.save({
      userId: user.id,
      refreshTokenHash,
      userAgent: meta.userAgent,
      ipAddress: meta.ipAddress,
      lastActiveAt: new Date(),
      expiresAt,
    });

    const ttl = Math.floor((expiresAt.getTime() - Date.now()) / 1000);
    await this.redis.set(
      `session:${session.id}`,
      JSON.stringify({ userId: user.id, role: user.role, sessionId: session.id }),
      'EX',
      ttl,
    );
    await this.redis.sadd(`user:${user.id}:sessions`, session.id);

    return session.id;
  }
}
