import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { DATA_SOURCE, OutboxEntity } from '@saganet/db';
import { REDIS_CLIENT, RedisClient } from '@saganet/redis';
import { KAFKA_TOPICS } from '@saganet/common';
import { UserEntity } from '../users/user.entity';
import { UserRole } from '../users/user-role.enum';
import { RegisterDto } from './dto/register.dto';
import { RegisterResponseDto } from './dto/register-response.dto';

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

    // Atomic: persist user + outbox event in a single transaction
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

      // Outbox → notification-service will send welcome + verify emails
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

    return {
      user: { id: user.id, email: user.email, role: user.role },
      message: 'Registration successful. Please check your email to verify your account.',
    };
  }

  // Session creation (session_id + refresh_token + access_token) lives in login — see login()
}
