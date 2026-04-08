import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '@saganet/db';
import { UserRole } from './user-role.enum';

@Entity('users')
export class UserEntity extends BaseEntity {
  @Index({ unique: true })
  @Column({ length: 255 })
  email: string;

  // null for OAuth users
  @Column({ nullable: true })
  passwordHash?: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.CUSTOMER })
  role: UserRole;

  @Column({ default: false })
  emailVerified: boolean;

  // SHA-256 hash of the one-time verification token (indexed for fast lookup)
  @Index()
  @Column({ nullable: true })
  verificationTokenHash?: string;

  @Column({ type: 'timestamp', nullable: true })
  verificationTokenExpiresAt?: Date;

  // Account lockout — incremented on each failed login attempt
  @Column({ default: 0 })
  failedLoginAttempts: number;

  @Column({ type: 'timestamp', nullable: true })
  lastFailedLoginAt?: Date;

  @Index()
  @Column({ nullable: true })
  resetTokenHash?: string;

  @Column({ type: 'timestamp', nullable: true })
  resetTokenExpiresAt?: Date;

  @Column({ length: 100, nullable: true })
  displayName?: string;

  @Column({ length: 2048, nullable: true })
  avatarUrl?: string;

  @Column({ default: false })
  isBanned: boolean;

  @Column({ type: 'timestamp', nullable: true })
  bannedAt?: Date;
}
