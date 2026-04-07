import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { DATA_SOURCE } from '@saganet/db';
import { STORAGE_CLIENT, StorageClient } from '@saganet/storage';
import { UserEntity } from '../users/user.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { validateImageMagicBytes, imageExtFromMagicBytes } from '../common/image-magic-bytes';

const MAX_AVATAR_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp']);

@Injectable()
export class ProfileService {
  constructor(
    @Inject(DATA_SOURCE) private readonly dataSource: DataSource,
    @Inject(STORAGE_CLIENT) private readonly storage: StorageClient,
  ) {}

  async getProfile(userId: string) {
    const user = await this.findUser(userId);
    return this.toDto(user);
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.findUser(userId);
    if (dto.displayName !== undefined) user.displayName = dto.displayName;
    const saved = await this.dataSource.getRepository(UserEntity).save(user);
    return this.toDto(saved);
  }

  async uploadAvatar(
    userId: string,
    file: Express.Multer.File,
  ) {
    if (file.size > MAX_AVATAR_BYTES) {
      throw new BadRequestException('Avatar must be under 5 MB');
    }

    if (!ALLOWED_MIME.has(file.mimetype)) {
      throw new BadRequestException('Only JPEG, PNG, and WebP images are allowed');
    }

    if (!validateImageMagicBytes(file.buffer)) {
      throw new BadRequestException('File content does not match an allowed image type');
    }

    const ext = imageExtFromMagicBytes(file.buffer);
    const key = `avatars/${userId}/${Date.now()}.${ext}`;

    const url = await this.storage.upload({
      key,
      buffer: file.buffer,
      contentType: file.mimetype,
    });

    const user = await this.findUser(userId);
    user.avatarUrl = url;
    const saved = await this.dataSource.getRepository(UserEntity).save(user);
    return this.toDto(saved);
  }

  private async findUser(userId: string): Promise<UserEntity> {
    const user = await this.dataSource.getRepository(UserEntity).findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  private toDto(user: UserEntity) {
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
    };
  }
}
