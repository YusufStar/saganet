import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { DATA_SOURCE } from '@saganet/db';
import { ProductEntity } from './product.entity';
import { ProductStatus } from './product-status.enum';
import { ProductListQueryDto } from './dto/product-list-query.dto';
import { ProductListResponseDto } from './dto/product-list-response.dto';
import { ProductResponseDto } from './dto/product-response.dto';
import { CreateProductDto } from '../vendor/dto/create-product.dto';
import { UpdateProductDto } from '../vendor/dto/update-product.dto';
import { toSlug, toUniqueSlug } from '../common/slug.util';
import { stripHtml } from '../common/utils/sanitize';
import { ProductEventsService } from './product-events.service';
import { ProductCacheService } from './product-cache.service';
import { AdminCreateProductDto } from '../admin/dto/admin-create-product.dto';
import { AdminUpdateProductDto } from '../admin/dto/admin-update-product.dto';
import { AdminProductQueryDto } from '../admin/dto/admin-product-query.dto';

@Injectable()
export class ProductService {
  constructor(
    @Inject(DATA_SOURCE) private readonly dataSource: DataSource,
    private readonly eventsService: ProductEventsService,
    private readonly cacheService: ProductCacheService,
  ) {}

  // ─── Public ──────────────────────────────────────────────────────────────────

  async findAll(query: ProductListQueryDto): Promise<ProductListResponseDto> {
    const repo = this.dataSource.getRepository(ProductEntity);
    const {
      page = 1,
      limit = 20,
      categoryId,
      minPrice,
      maxPrice,
      search,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = query;

    const qb = repo
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.images', 'images')
      .where('product.status = :status', { status: ProductStatus.ACTIVE })
      .andWhere('product.deletedAt IS NULL');

    if (categoryId) qb.andWhere('product.categoryId = :categoryId', { categoryId });
    if (minPrice) qb.andWhere('CAST(product.price AS NUMERIC) >= :minPrice', { minPrice });
    if (maxPrice) qb.andWhere('CAST(product.price AS NUMERIC) <= :maxPrice', { maxPrice });
    if (search) {
      qb.andWhere(
        '(product.name ILIKE :search OR product.description ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    const allowedSort: Record<string, string> = {
      price: 'product.price',
      createdAt: 'product.createdAt',
      name: 'product.name',
    };
    qb.orderBy(allowedSort[sortBy] ?? 'product.createdAt', sortOrder);

    const [data, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data: data.map(this.toDto), total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string): Promise<ProductResponseDto> {
    const cached = await this.cacheService.getProduct(id);
    if (cached) return cached;

    const product = await this.dataSource.getRepository(ProductEntity).findOne({
      where: { id, status: ProductStatus.ACTIVE },
      relations: ['images'],
    });

    if (!product) throw new NotFoundException('Product not found');
    const dto = this.toDto(product);
    await this.cacheService.setProduct(id, dto);
    return dto;
  }

  // ─── Vendor ──────────────────────────────────────────────────────────────────

  async createForVendor(vendorId: string, dto: CreateProductDto): Promise<ProductResponseDto> {
    const repo = this.dataSource.getRepository(ProductEntity);

    const slug = dto.slug ? toSlug(dto.slug) : toUniqueSlug(dto.name);

    const product = repo.create({
      vendorId,
      name: dto.name,
      description: dto.description ? stripHtml(dto.description) : dto.description,
      price: dto.price,
      categoryId: dto.categoryId,
      slug,
      status: ProductStatus.PENDING_REVIEW, // always — vendor cannot override
    });

    const saved = await repo.save(product);
    await this.eventsService.emitProductCreated(saved);
    return this.toDto(saved);
  }

  async findAllForVendor(
    vendorId: string,
    query: ProductListQueryDto,
  ): Promise<ProductListResponseDto> {
    const repo = this.dataSource.getRepository(ProductEntity);
    const { page = 1, limit = 20 } = query;

    const [data, total] = await repo.findAndCount({
      where: { vendorId },
      relations: ['images'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data: data.map(this.toDto), total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async updateForVendor(
    id: string,
    vendorId: string,
    dto: UpdateProductDto,
  ): Promise<ProductResponseDto> {
    const repo = this.dataSource.getRepository(ProductEntity);
    const product = await repo.findOne({ where: { id }, relations: ['images'] });

    if (!product) throw new NotFoundException('Product not found');
    if (product.vendorId !== vendorId) throw new ForbiddenException('Not your product');

    const oldPrice = product.price;

    if (dto.name !== undefined) product.name = dto.name;
    if (dto.description !== undefined) product.description = stripHtml(dto.description);
    if (dto.price !== undefined) product.price = dto.price;
    if (dto.categoryId !== undefined) product.categoryId = dto.categoryId;
    if (dto.slug !== undefined) product.slug = toSlug(dto.slug);

    // Any edit requires re-approval
    product.status = ProductStatus.PENDING_REVIEW;
    product.rejectionReason = undefined;

    const saved = await repo.save(product);
    await this.cacheService.invalidateProduct(id);

    if (dto.price !== undefined && dto.price !== oldPrice) {
      await this.eventsService.emitProductPriceChanged(id, oldPrice, dto.price, vendorId);
    }

    return this.toDto(saved);
  }

  async softDeleteForVendor(id: string, vendorId: string): Promise<void> {
    const repo = this.dataSource.getRepository(ProductEntity);
    const product = await repo.findOne({ where: { id } });

    if (!product) throw new NotFoundException('Product not found');
    if (product.vendorId !== vendorId) throw new ForbiddenException('Not your product');

    product.status = ProductStatus.DELETED;
    product.deletedAt = new Date();
    await repo.save(product);
    await this.cacheService.invalidateProduct(id);
    await this.eventsService.emitProductDeleted(id, vendorId);
  }

  // ─── Admin ───────────────────────────────────────────────────────────────────

  async findAllForAdmin(query: AdminProductQueryDto): Promise<ProductListResponseDto> {
    const repo = this.dataSource.getRepository(ProductEntity);
    const {
      page = 1,
      limit = 20,
      categoryId,
      minPrice,
      maxPrice,
      search,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      vendorId,
      status,
    } = query;

    const qb = repo
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.images', 'images')
      .where('product.deletedAt IS NULL');

    if (status) qb.andWhere('product.status = :status', { status });
    if (vendorId) qb.andWhere('product.vendorId = :vendorId', { vendorId });
    if (categoryId) qb.andWhere('product.categoryId = :categoryId', { categoryId });
    if (minPrice) qb.andWhere('CAST(product.price AS NUMERIC) >= :minPrice', { minPrice });
    if (maxPrice) qb.andWhere('CAST(product.price AS NUMERIC) <= :maxPrice', { maxPrice });
    if (search) {
      qb.andWhere(
        '(product.name ILIKE :search OR product.description ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    const allowedSort: Record<string, string> = {
      price: 'product.price',
      createdAt: 'product.createdAt',
      name: 'product.name',
    };
    qb.orderBy(allowedSort[sortBy] ?? 'product.createdAt', sortOrder);

    const [data, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data: data.map(this.toDto), total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOneForAdmin(id: string): Promise<ProductResponseDto> {
    const product = await this.dataSource.getRepository(ProductEntity).findOne({
      where: { id },
      relations: ['images'],
    });
    if (!product) throw new NotFoundException('Product not found');
    return this.toDto(product);
  }

  async createForAdmin(dto: AdminCreateProductDto): Promise<ProductResponseDto> {
    const repo = this.dataSource.getRepository(ProductEntity);
    const slug = dto.slug ? toSlug(dto.slug) : toUniqueSlug(dto.name);

    const product = repo.create({
      vendorId: dto.vendorId,
      name: dto.name,
      description: dto.description ? stripHtml(dto.description) : dto.description,
      price: dto.price,
      categoryId: dto.categoryId,
      slug,
      status: dto.status ?? ProductStatus.ACTIVE,
    });

    const saved = await repo.save(product);
    await this.eventsService.emitProductCreated(saved);
    return this.toDto(saved);
  }

  async updateForAdmin(id: string, dto: AdminUpdateProductDto): Promise<ProductResponseDto> {
    const repo = this.dataSource.getRepository(ProductEntity);
    const product = await repo.findOne({ where: { id }, relations: ['images'] });
    if (!product) throw new NotFoundException('Product not found');

    const oldPrice = product.price;

    if (dto.name !== undefined) product.name = dto.name;
    if (dto.description !== undefined) product.description = stripHtml(dto.description);
    if (dto.price !== undefined) product.price = dto.price;
    if (dto.categoryId !== undefined) product.categoryId = dto.categoryId;
    if (dto.slug !== undefined) product.slug = toSlug(dto.slug);
    if (dto.status !== undefined) product.status = dto.status;
    if (dto.rejectionReason !== undefined) product.rejectionReason = dto.rejectionReason;

    const saved = await repo.save(product);
    await this.cacheService.invalidateProduct(id);

    if (dto.price !== undefined && dto.price !== oldPrice) {
      await this.eventsService.emitProductPriceChanged(id, oldPrice, dto.price, product.vendorId);
    }

    return this.toDto(saved);
  }

  async hardDelete(id: string): Promise<void> {
    const repo = this.dataSource.getRepository(ProductEntity);
    const product = await repo.findOne({ where: { id } });
    if (!product) throw new NotFoundException('Product not found');
    await repo.delete(id);
    await this.cacheService.invalidateProduct(id);
  }

  async approveProduct(id: string): Promise<ProductResponseDto> {
    const repo = this.dataSource.getRepository(ProductEntity);
    const product = await repo.findOne({ where: { id }, relations: ['images'] });
    if (!product) throw new NotFoundException('Product not found');

    product.status = ProductStatus.ACTIVE;
    product.rejectionReason = undefined;

    const saved = await repo.save(product);
    await this.cacheService.invalidateProduct(id);
    await this.eventsService.emitProductApproved(id, product.vendorId);
    return this.toDto(saved);
  }

  async rejectProduct(id: string, reason: string): Promise<ProductResponseDto> {
    const repo = this.dataSource.getRepository(ProductEntity);
    const product = await repo.findOne({ where: { id }, relations: ['images'] });
    if (!product) throw new NotFoundException('Product not found');

    product.status = ProductStatus.REJECTED;
    product.rejectionReason = reason;

    const saved = await repo.save(product);
    await this.cacheService.invalidateProduct(id);
    await this.eventsService.emitProductRejected(id, product.vendorId, reason);
    return this.toDto(saved);
  }

  async suspendProduct(id: string): Promise<ProductResponseDto> {
    const repo = this.dataSource.getRepository(ProductEntity);
    const product = await repo.findOne({ where: { id }, relations: ['images'] });
    if (!product) throw new NotFoundException('Product not found');

    product.status = ProductStatus.SUSPENDED;

    const saved = await repo.save(product);
    await this.cacheService.invalidateProduct(id);
    await this.eventsService.emitProductSuspended(id, product.vendorId);
    return this.toDto(saved);
  }

  // ─── Shared ──────────────────────────────────────────────────────────────────

  toDto(product: ProductEntity): ProductResponseDto {
    return {
      id: product.id,
      vendorId: product.vendorId,
      name: product.name,
      description: product.description,
      slug: product.slug,
      price: product.price,
      categoryId: product.categoryId,
      images: (product.images ?? []).map((img) => ({
        id: img.id,
        url: img.url,
        type: img.type,
        displayOrder: img.displayOrder,
      })),
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }
}
