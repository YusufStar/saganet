import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '@saganet/db';
import { UserEntity } from './user.entity';
import { OAuthProvider } from './oauth-provider.enum';

@Entity('user_oauth_accounts')
@Index(['provider', 'providerAccountId'], { unique: true })
export class UserOAuthAccountEntity extends BaseEntity {
  @Index()
  @Column('uuid')
  userId: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @Column({ type: 'enum', enum: OAuthProvider })
  provider: OAuthProvider;

  // Provider'ın kendi sistemindeki kullanıcı ID'si (Google sub, GitHub id...)
  @Column({ length: 255 })
  providerAccountId: string;

  // Provider'dan gelen access token — opsiyonel, şifrelenmiş saklanmalı (ilerleyen aşama)
  @Column({ type: 'text', nullable: true })
  accessToken?: string;

  @Column({ type: 'text', nullable: true })
  refreshToken?: string;

  @Column({ type: 'timestamp', nullable: true })
  accessTokenExpiresAt?: Date;

  // İstenen izinler (openid, email, profile...)
  @Column({ length: 512, nullable: true })
  scope?: string;
}
