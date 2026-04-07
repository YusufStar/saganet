import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { DATA_SOURCE } from '@saganet/db';
import { CategoryEntity } from './category.entity';
import { CategoryResponseDto } from './dto/category-response.dto';
import { ProductService } from '../product/product.service';
import { ProductListResponseDto } from '../product/dto/product-list-response.dto';
import { AdminCreateCategoryDto } from '../admin/dto/admin-create-category.dto';
import { AdminUpdateCategoryDto } from '../admin/dto/admin-update-category.dto';
import { toSlug, toUniqueSlug } from '../common/slug.util';

@Injectable()
export class CategoryService {
  constructor(
    @Inject(DATA_SOURCE) private readonly dataSource: DataSource,
    private readonly productService: ProductService,
  ) {}

  async findAll(): Promise<CategoryResponseDto[]> {
    const repo = this.dataSource.getRepository(CategoryEntity);

    const categories = await repo.find({
      where: { deletedAt: undefined },
      relations: ['children'],
      order: { name: 'ASC' },
    });

    // Return only root categories (parentId = null); children are nested
    return categories
      .filter((c) => !c.parentId)
      .map(this.toDto);
  }

  async findProductsByCategory(categoryId: string): Promise<ProductListResponseDto> {
    const repo = this.dataSource.getRepository(CategoryEntity);

    const category = await repo.findOne({ where: { id: categoryId } });
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return this.productService.findAll({ categoryId, page: 1, limit: 20 });
  }

  async createCategory(dto: AdminCreateCategoryDto): Promise<CategoryResponseDto> {
    const repo = this.dataSource.getRepository(CategoryEntity);
    const slug = dto.slug ? toSlug(dto.slug) : toUniqueSlug(dto.name);
    const category = repo.create({ name: dto.name, slug, parentId: dto.parentId });
    const saved = await repo.save(category);
    return this.toDto(saved);
  }

  async updateCategory(id: string, dto: AdminUpdateCategoryDto): Promise<CategoryResponseDto> {
    const repo = this.dataSource.getRepository(CategoryEntity);
    const category = await repo.findOne({ where: { id } });
    if (!category) throw new NotFoundException('Category not found');

    if (dto.name !== undefined) category.name = dto.name;
    if (dto.slug !== undefined) category.slug = toSlug(dto.slug);
    if (dto.parentId !== undefined) category.parentId = dto.parentId;

    const saved = await repo.save(category);
    return this.toDto(saved);
  }

  async deleteCategory(id: string): Promise<void> {
    const repo = this.dataSource.getRepository(CategoryEntity);
    const category = await repo.findOne({ where: { id } });
    if (!category) throw new NotFoundException('Category not found');
    category.deletedAt = new Date();
    await repo.save(category);
  }

  private toDto(category: CategoryEntity): CategoryResponseDto {
    return {
      id: category.id,
      name: category.name,
      slug: category.slug,
      parentId: category.parentId,
      children: (category.children ?? []).map((child) => ({
        id: child.id,
        name: child.name,
        slug: child.slug,
        parentId: child.parentId,
        children: [],
      })),
    };
  }
}
