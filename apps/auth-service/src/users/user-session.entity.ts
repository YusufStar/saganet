import { Column, Entity, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '@saganet/db';
import { UserEntity } from './user.entity';

@Entity('user_sessions')
export class UserSessionEntity extends BaseEntity {
  // Hangi kullanıcıya ait
  @Index()
  @Column('uuid')
  userId: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  // Refresh token'ın bcrypt hash'i — asla raw token saklanmaz
  @Column()
  refreshTokenHash: string;

  // Cihaz / tarayıcı bilgisi
  @Column({ length: 512, nullable: true })
  userAgent?: string;

  @Column({ length: 64, nullable: true })
  ipAddress?: string;

  // Token her yenilendiğinde güncellenir
  @Column({ type: 'timestamp' })
  lastActiveAt: Date;

  // Session'ın mutlak bitiş zamanı (refresh token ömrü, ~7 gün)
  @Index()
  @Column({ type: 'timestamp' })
  expiresAt: Date;

  // Manuel iptal (cihaz çıkışı veya "tüm oturumlardan çık")
  @Column({ type: 'timestamp', nullable: true })
  revokedAt?: Date;

  // Refresh token family — all rotations of the same login share this ID.
  // Reuse of an old token triggers revocation of the entire family.
  @Index()
  @Column('uuid')
  familyId: string;
}
