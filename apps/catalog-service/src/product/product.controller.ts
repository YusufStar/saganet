import { Controller, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ProductService } from './product.service';
import { ProductListQueryDto } from './dto/product-list-query.dto';
import { ProductListResponseDto } from './dto/product-list-response.dto';
import { ProductResponseDto } from './dto/product-response.dto';
import { productViewsTotal } from '../metrics/metrics.controller';

@ApiTags('products (public)')
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List active products with filtering and pagination' })
  @ApiOkResponse({ type: ProductListResponseDto })
  findAll(@Query() query: ProductListQueryDto): Promise<ProductListResponseDto> {
    return this.productService.findAll(query);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get a single active product by ID' })
  @ApiOkResponse({ type: ProductResponseDto })
  @ApiNotFoundResponse({ description: 'Product not found or not active' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<ProductResponseDto> {
    const result = await this.productService.findOne(id);
    productViewsTotal.labels(id).inc();
    return result;
  }
}
