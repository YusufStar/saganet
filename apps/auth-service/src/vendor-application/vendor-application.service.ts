import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { DATA_SOURCE } from '@saganet/db';
import { STORAGE_CLIENT, StorageClient } from '@saganet/storage';
import { UserRole } from '@saganet/common';
import { UserEntity } from '../users/user.entity';
import {
  VendorApplicationEntity,
  VendorApplicationStatus,
} from './vendor-application.entity';
import { CreateVendorApplicationDto } from './dto/create-vendor-application.dto';
import { VendorApplicationListQueryDto } from './dto/vendor-application-list-query.dto';
import { RejectVendorApplicationDto } from './dto/review-vendor-application.dto';
import { validateImageMagicBytes, imageExtFromMagicBytes } from '../common/image-magic-bytes';

const MAX_DOC_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'application/pdf']);

@Injectable()
export class VendorApplicationService {
  constructor(
    @Inject(DATA_SOURCE) private readonly dataSource: DataSource,
    @Inject(STORAGE_CLIENT) private readonly storage: StorageClient,
  ) {}

  // ─── Customer: submit application ───────────────────────────────────────────

  async create(userId: string, dto: CreateVendorApplicationDto) {
    const repo = this.dataSource.getRepository(VendorApplicationEntity);

    // Check user is not already a vendor
    const user = await this.findUser(userId);
    if (user.role === UserRole.VENDOR) {
      throw new ConflictException('You are already a vendor');
    }

    // Check no pending application exists
    const existing = await repo.findOne({
      where: { userId, status: VendorApplicationStatus.PENDING },
    });
    if (existing) {
      throw new ConflictException('You already have a pending application');
    }

    const app = repo.create({ ...dto, userId });
    const saved = await repo.save(app);
    return this.toDto(saved);
  }

  // ─── Customer: get own application ──────────────────────────────────────────

  async getOwn(userId: string) {
    const app = await this.dataSource
      .getRepository(VendorApplicationEntity)
      .findOne({
        where: { userId },
        order: { createdAt: 'DESC' },
      });
    if (!app) return null;
    return this.toDto(app);
  }

  // ─── Customer: upload document ──────────────────────────────────────────────

  async uploadDocument(
    userId: string,
    field: 'identityDocument' | 'taxDocument' | 'signatureCircular',
    file: Express.Multer.File,
  ) {
    const repo = this.dataSource.getRepository(VendorApplicationEntity);
    const app = await repo.findOne({
      where: { userId, status: VendorApplicationStatus.PENDING },
    });
    if (!app) {
      throw new NotFoundException('No pending application found');
    }

    if (file.size > MAX_DOC_BYTES) {
      throw new BadRequestException('Document must be under 10 MB');
    }

    // For images, validate magic bytes; for PDF, check header
    const isPdf = file.mimetype === 'application/pdf';
    if (!isPdf) {
      if (!ALLOWED_MIME.has(file.mimetype)) {
        throw new BadRequestException('Only JPEG, PNG, WebP or PDF files are allowed');
      }
      if (!validateImageMagicBytes(file.buffer)) {
        throw new BadRequestException('File content does not match an allowed image type');
      }
    } else {
      // PDF magic bytes: %PDF
      if (file.buffer.length < 4 || file.buffer.toString('ascii', 0, 4) !== '%PDF') {
        throw new BadRequestException('Invalid PDF file');
      }
    }

    const ext = isPdf ? 'pdf' : imageExtFromMagicBytes(file.buffer);
    const key = `vendor-applications/${app.id}/${field}-${Date.now()}.${ext}`;

    const url = await this.storage.upload({
      key,
      buffer: file.buffer,
      contentType: file.mimetype,
    });

    const urlField = `${field}Url` as keyof VendorApplicationEntity;
    (app as unknown as Record<string, unknown>)[urlField] = url;

    const saved = await repo.save(app);
    return this.toDto(saved);
  }

  // ─── Admin: list all applications ───────────────────────────────────────────

  async listAll(query: VendorApplicationListQueryDto) {
    const repo = this.dataSource.getRepository(VendorApplicationEntity);
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const qb = repo.createQueryBuilder('app');

    if (query.status) {
      qb.andWhere('app.status = :status', { status: query.status });
    }

    if (query.search) {
      qb.andWhere(
        '(app.companyName ILIKE :search OR app.firstName ILIKE :search OR app.lastName ILIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    const sortBy = query.sortBy ?? 'createdAt';
    const sortOrder = query.sortOrder ?? 'DESC';
    qb.orderBy(`app.${sortBy}`, sortOrder);

    const [data, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data: data.map((a) => this.toDto(a)),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  // ─── Admin: get single application ──────────────────────────────────────────

  async getOne(id: string) {
    const app = await this.dataSource
      .getRepository(VendorApplicationEntity)
      .findOne({ where: { id } });
    if (!app) throw new NotFoundException('Application not found');
    return this.toDto(app);
  }

  // ─── Admin: approve ─────────────────────────────────────────────────────────

  async approve(id: string, actorId: string) {
    return this.dataSource.transaction(async (em) => {
      const appRepo = em.getRepository(VendorApplicationEntity);
      const userRepo = em.getRepository(UserEntity);

      const app = await appRepo.findOne({ where: { id } });
      if (!app) throw new NotFoundException('Application not found');
      if (app.status !== VendorApplicationStatus.PENDING) {
        throw new BadRequestException('Only pending applications can be approved');
      }

      // Update application status
      app.status = VendorApplicationStatus.APPROVED;
      app.reviewedBy = actorId;
      app.reviewedAt = new Date();
      await appRepo.save(app);

      // Promote user to VENDOR
      const user = await userRepo.findOne({ where: { id: app.userId } });
      if (user) {
        user.role = UserRole.VENDOR;
        await userRepo.save(user);
      }

      return this.toDto(app);
    });
  }

  // ─── Admin: reject ──────────────────────────────────────────────────────────

  async reject(id: string, actorId: string, dto: RejectVendorApplicationDto) {
    const repo = this.dataSource.getRepository(VendorApplicationEntity);
    const app = await repo.findOne({ where: { id } });
    if (!app) throw new NotFoundException('Application not found');
    if (app.status !== VendorApplicationStatus.PENDING) {
      throw new BadRequestException('Only pending applications can be rejected');
    }

    app.status = VendorApplicationStatus.REJECTED;
    app.reviewedBy = actorId;
    app.reviewedAt = new Date();
    app.rejectionReason = dto.reason ?? null;

    const saved = await repo.save(app);
    return this.toDto(saved);
  }

  // ─── Helpers ────────────────────────────────────────────────────────────────

  private async findUser(userId: string): Promise<UserEntity> {
    const user = await this.dataSource
      .getRepository(UserEntity)
      .findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  private toDto(app: VendorApplicationEntity) {
    return {
      id: app.id,
      userId: app.userId,
      status: app.status,
      firstName: app.firstName,
      lastName: app.lastName,
      identityNumber: app.identityNumber,
      phone: app.phone,
      companyName: app.companyName,
      companyType: app.companyType,
      taxNumber: app.taxNumber,
      taxOffice: app.taxOffice,
      street: app.street,
      district: app.district,
      city: app.city,
      postalCode: app.postalCode,
      iban: app.iban,
      bankName: app.bankName,
      about: app.about,
      identityDocumentUrl: app.identityDocumentUrl,
      taxDocumentUrl: app.taxDocumentUrl,
      signatureCircularUrl: app.signatureCircularUrl,
      reviewedBy: app.reviewedBy,
      reviewedAt: app.reviewedAt,
      rejectionReason: app.rejectionReason,
      createdAt: app.createdAt,
      updatedAt: app.updatedAt,
    };
  }
}
