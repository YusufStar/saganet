import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '@saganet/db';

export enum VendorApplicationStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

@Entity('vendor_applications')
export class VendorApplicationEntity extends BaseEntity {
  @Index()
  @Column('uuid')
  userId: string;

  @Column({
    type: 'enum',
    enum: VendorApplicationStatus,
    default: VendorApplicationStatus.PENDING,
  })
  status: VendorApplicationStatus;

  // ─── Personal ─────────────────────────────────────────────────────────────

  @Column({ length: 50 })
  firstName: string;

  @Column({ length: 50 })
  lastName: string;

  @Column({ length: 11 })
  identityNumber: string; // TC Kimlik No

  @Column({ length: 20 })
  phone: string;

  // ─── Company ──────────────────────────────────────────────────────────────

  @Column({ length: 200 })
  companyName: string;

  /** Şahıs / Limited / Anonim */
  @Column({ length: 50 })
  companyType: string;

  @Column({ length: 20, nullable: true })
  taxNumber?: string;

  @Column({ length: 100, nullable: true })
  taxOffice?: string;

  // ─── Address ──────────────────────────────────────────────────────────────

  @Column({ length: 255 })
  street: string;

  @Column({ length: 100, nullable: true })
  district?: string;

  @Column({ length: 100 })
  city: string;

  @Column({ length: 20, nullable: true })
  postalCode?: string;

  // ─── Bank ─────────────────────────────────────────────────────────────────

  @Column({ length: 34 })
  iban: string;

  @Column({ length: 100, nullable: true })
  bankName?: string;

  // ─── About ────────────────────────────────────────────────────────────────

  @Column({ type: 'text', nullable: true })
  about?: string;

  // ─── Documents ────────────────────────────────────────────────────────────

  @Column({ length: 2048, nullable: true })
  identityDocumentUrl?: string;

  @Column({ length: 2048, nullable: true })
  taxDocumentUrl?: string;

  @Column({ length: 2048, nullable: true })
  signatureCircularUrl?: string;

  // ─── Review ───────────────────────────────────────────────────────────────

  @Column({ type: 'uuid', nullable: true })
  reviewedBy?: string;

  @Column({ type: 'timestamp', nullable: true })
  reviewedAt?: Date;

  @Column({ type: 'text', nullable: true })
  rejectionReason?: string;
}
