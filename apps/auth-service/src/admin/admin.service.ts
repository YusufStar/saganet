import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { DATA_SOURCE } from '@saganet/db';
import { REDIS_CLIENT, RedisClient } from '@saganet/redis';
import { UserRole } from '@saganet/common';
import { UserEntity } from '../users/user.entity';
import { UserSessionEntity } from '../users/user-session.entity';
import { AdminUserListQueryDto } from './dto/admin-user-list-query.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';

@Injectable()
export class AdminService {
  constructor(
    @Inject(DATA_SOURCE) private readonly dataSource: DataSource,
    @Inject(REDIS_CLIENT) private readonly redis: RedisClient,
  ) {}

  async listUsers(query: AdminUserListQueryDto) {
    const repo = this.dataSource.getRepository(UserEntity);
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const qb = repo.createQueryBuilder('user');

    if (query.role) {
      qb.andWhere('user.role = :role', { role: query.role });
    }

    if (query.search) {
      qb.andWhere(
        '(user.email ILIKE :search OR user.displayName ILIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    const sortBy = query.sortBy ?? 'createdAt';
    const sortOrder = query.sortOrder ?? 'DESC';
    qb.orderBy(`user.${sortBy}`, sortOrder);

    const [data, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data: data.map((u) => this.toDto(u)),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getUser(id: string) {
    const user = await this.findUser(id);
    return this.toDto(user);
  }

  async updateRole(id: string, dto: UpdateUserRoleDto, actorId: string) {
    if (id === actorId) {
      throw new ForbiddenException('Cannot change your own role');
    }

    const user = await this.findUser(id);
    user.role = dto.role;
    const saved = await this.dataSource.getRepository(UserEntity).save(user);
    return this.toDto(saved);
  }

  async banUser(id: string, actorId: string) {
    if (id === actorId) {
      throw new ForbiddenException('Cannot ban yourself');
    }

    const user = await this.findUser(id);
    if (user.role === UserRole.ADMIN) {
      throw new ForbiddenException('Cannot ban another admin');
    }

    user.isBanned = true;
    user.bannedAt = new Date();
    await this.dataSource.getRepository(UserEntity).save(user);

    // Invalidate all active sessions so the ban takes effect immediately
    await this.revokeAllSessions(id);

    return { message: 'User banned' };
  }

  async unbanUser(id: string) {
    const user = await this.findUser(id);
    user.isBanned = false;
    user.bannedAt = undefined;
    user.failedLoginAttempts = 0;
    user.lastFailedLoginAt = undefined;
    await this.dataSource.getRepository(UserEntity).save(user);
    return { message: 'User unbanned' };
  }

  private async revokeAllSessions(userId: string): Promise<void> {
    // Clear Redis sessions
    const sessionIds = await this.redis.smembers(`user:${userId}:sessions`);
    if (sessionIds.length) {
      await Promise.all(sessionIds.map((sid) => this.redis.del(`session:${sid}`)));
    }
    await this.redis.del(`user:${userId}:sessions`);

    // Revoke DB sessions
    await this.dataSource
      .getRepository(UserSessionEntity)
      .createQueryBuilder()
      .update()
      .set({ revokedAt: new Date() })
      .where('userId = :userId AND revokedAt IS NULL', { userId })
      .execute();
  }

  private async findUser(id: string): Promise<UserEntity> {
    const user = await this.dataSource
      .getRepository(UserEntity)
      .findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  private toDto(user: UserEntity) {
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      displayName: user.displayName,
      emailVerified: user.emailVerified,
      isBanned: user.isBanned,
      bannedAt: user.bannedAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
