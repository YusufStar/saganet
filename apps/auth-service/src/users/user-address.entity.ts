import { Column, Entity, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '@saganet/db';
import { UserEntity } from './user.entity';

@Entity('user_addresses')
export class UserAddressEntity extends BaseEntity {
  @Index()
  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @Column({ length: 50, nullable: true })
  label?: string; // "Ev", "İş", vb.

  @Column({ length: 100 })
  fullName: string;

  @Column({ length: 20, nullable: true })
  phone?: string;

  @Column({ length: 255 })
  street: string;

  @Column({ length: 100, nullable: true })
  district?: string;

  @Column({ length: 100 })
  city: string;

  @Column({ length: 20, nullable: true })
  postalCode?: string;

  @Column({ length: 100, default: 'Türkiye' })
  country: string;

  @Column({ default: false })
  isDefault: boolean;
}
