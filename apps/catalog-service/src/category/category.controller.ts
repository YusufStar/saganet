import { Controller, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CategoryService } from './category.service';
import { CategoryResponseDto } from './dto/category-response.dto';
import { ProductListResponseDto } from '../product/dto/product-list-response.dto';

@ApiTags('categories (public)')
@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List all categories (nested tree)' })
  @ApiOkResponse({ type: [CategoryResponseDto] })
  findAll(): Promise<CategoryResponseDto[]> {
    return this.categoryService.findAll();
  }

  @Get(':id/products')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get active products for a specific category' })
  @ApiOkResponse({ type: ProductListResponseDto })
  @ApiNotFoundResponse({ description: 'Category not found' })
  findProducts(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ProductListResponseDto> {
    return this.categoryService.findProductsByCategory(id);
  }
}
