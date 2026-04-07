import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ProductService } from '../product/product.service';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles, UserRole } from '../common/decorators/roles.decorator';
import { AdminCreateProductDto } from './dto/admin-create-product.dto';
import { AdminUpdateProductDto } from './dto/admin-update-product.dto';
import { AdminProductQueryDto } from './dto/admin-product-query.dto';
import { RejectProductDto } from './dto/approve-reject.dto';
import { ProductResponseDto } from '../product/dto/product-response.dto';
import { ProductListResponseDto } from '../product/dto/product-list-response.dto';

@ApiTags('Admin — Products')
@ApiBearerAuth('access-token')
@UseGuards(RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin/products')
export class AdminProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List all products (any status, optional vendorId filter)' })
  @ApiOkResponse({ type: ProductListResponseDto })
  findAll(@Query() query: AdminProductQueryDto): Promise<ProductListResponseDto> {
    return this.productService.findAllForAdmin(query);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create product directly as ACTIVE (admin)' })
  @ApiCreatedResponse({ type: ProductResponseDto })
  create(@Body() dto: AdminCreateProductDto): Promise<ProductResponseDto> {
    return this.productService.createForAdmin(dto);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get any product by ID regardless of status' })
  @ApiOkResponse({ type: ProductResponseDto })
  @ApiNotFoundResponse({ description: 'Product not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<ProductResponseDto> {
    return this.productService.findOneForAdmin(id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update any product (admin)' })
  @ApiOkResponse({ type: ProductResponseDto })
  @ApiNotFoundResponse({ description: 'Product not found' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AdminUpdateProductDto,
  ): Promise<ProductResponseDto> {
    return this.productService.updateForAdmin(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Hard delete product (admin)' })
  @ApiNoContentResponse()
  @ApiNotFoundResponse({ description: 'Product not found' })
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.productService.hardDelete(id);
  }

  @Patch(':id/approve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Approve product — status → ACTIVE' })
  @ApiOkResponse({ type: ProductResponseDto })
  @ApiNotFoundResponse({ description: 'Product not found' })
  approve(@Param('id', ParseUUIDPipe) id: string): Promise<ProductResponseDto> {
    return this.productService.approveProduct(id);
  }

  @Patch(':id/reject')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reject product — status → REJECTED + rejectionReason' })
  @ApiOkResponse({ type: ProductResponseDto })
  @ApiNotFoundResponse({ description: 'Product not found' })
  reject(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: RejectProductDto,
  ): Promise<ProductResponseDto> {
    return this.productService.rejectProduct(id, dto.reason);
  }

  @Patch(':id/suspend')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Suspend product — status → SUSPENDED' })
  @ApiOkResponse({ type: ProductResponseDto })
  @ApiNotFoundResponse({ description: 'Product not found' })
  suspend(@Param('id', ParseUUIDPipe) id: string): Promise<ProductResponseDto> {
    return this.productService.suspendProduct(id);
  }
}
