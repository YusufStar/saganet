import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '@saganet/db';
import { UserRole } from './user-role.enum';

@Entity('users')
export class UserEntity extends BaseEntity {
  @Index({ unique: true })
  @Column({ length: 255 })
  email: string;

  @Column()
  passwordHash: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.CUSTOMER })
  role: UserRole;
}
