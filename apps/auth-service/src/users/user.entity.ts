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
}
