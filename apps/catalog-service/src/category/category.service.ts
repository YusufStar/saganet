import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { DATA_SOURCE } from '@saganet/db';
import { CategoryEntity } from './category.entity';
import { CategoryResponseDto } from './dto/category-response.dto';
import { ProductService } from '../product/product.service';
import { ProductListResponseDto } from '../product/dto/product-list-response.dto';

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
