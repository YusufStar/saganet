import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { DATA_SOURCE } from '@saganet/db';
import { ProductEntity } from './product.entity';
import { ProductStatus } from './product-status.enum';
import { ProductListQueryDto } from './dto/product-list-query.dto';
import { ProductListResponseDto } from './dto/product-list-response.dto';
import { ProductResponseDto } from './dto/product-response.dto';

@Injectable()
export class ProductService {
  constructor(@Inject(DATA_SOURCE) private readonly dataSource: DataSource) {}

  async findAll(query: ProductListQueryDto): Promise<ProductListResponseDto> {
    const repo = this.dataSource.getRepository(ProductEntity);
    const { page = 1, limit = 20, categoryId, minPrice, maxPrice, search, sortBy = 'createdAt', sortOrder = 'DESC' } = query;

    const qb = repo
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.images', 'images')
      .where('product.status = :status', { status: ProductStatus.ACTIVE })
      .andWhere('product.deletedAt IS NULL');

    if (categoryId) {
      qb.andWhere('product.categoryId = :categoryId', { categoryId });
    }

    if (minPrice) {
      qb.andWhere('CAST(product.price AS NUMERIC) >= :minPrice', { minPrice });
    }

    if (maxPrice) {
      qb.andWhere('CAST(product.price AS NUMERIC) <= :maxPrice', { maxPrice });
    }

    if (search) {
      qb.andWhere(
        '(product.name ILIKE :search OR product.description ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    const allowedSortFields = { price: 'product.price', createdAt: 'product.createdAt', name: 'product.name' };
    const orderField = allowedSortFields[sortBy] ?? 'product.createdAt';
    qb.orderBy(orderField, sortOrder);

    const [data, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data: data.map(this.toDto),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<ProductResponseDto> {
    const repo = this.dataSource.getRepository(ProductEntity);

    const product = await repo.findOne({
      where: { id, status: ProductStatus.ACTIVE },
      relations: ['images'],
    });

    if (!product) {
      throw new NotFoundException(`Product not found`);
    }

    return this.toDto(product);
  }

  private toDto(product: ProductEntity): ProductResponseDto {
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
