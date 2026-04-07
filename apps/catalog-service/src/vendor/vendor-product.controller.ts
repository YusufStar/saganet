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
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Request } from 'express';
import { ProductService } from '../product/product.service';
import { ImageUploadService } from './image-upload.service';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles, UserRole } from '../common/decorators/roles.decorator';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductListQueryDto } from '../product/dto/product-list-query.dto';
import { ProductResponseDto } from '../product/dto/product-response.dto';
import { ProductListResponseDto } from '../product/dto/product-list-response.dto';
import { ProductImageEntity } from '../product/product-image.entity';

@ApiTags('vendor / products')
@ApiBearerAuth('access-token')
@UseGuards(RolesGuard)
@Roles(UserRole.VENDOR, UserRole.ADMIN)
@Controller('vendor/products')
export class VendorProductController {
  constructor(
    private readonly productService: ProductService,
    private readonly imageUploadService: ImageUploadService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new product (status=PENDING_REVIEW automatically)' })
  @ApiCreatedResponse({ type: ProductResponseDto })
  @ApiUnauthorizedResponse({ description: 'Missing auth headers' })
  @ApiForbiddenResponse({ description: 'Insufficient role' })
  create(@Req() req: Request, @Body() dto: CreateProductDto): Promise<ProductResponseDto> {
    const vendorId = req.headers['x-user-id'] as string;
    return this.productService.createForVendor(vendorId, dto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "List vendor's own products (all statuses)" })
  @ApiOkResponse({ type: ProductListResponseDto })
  findAll(@Req() req: Request, @Query() query: ProductListQueryDto): Promise<ProductListResponseDto> {
    const vendorId = req.headers['x-user-id'] as string;
    return this.productService.findAllForVendor(vendorId, query);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Update vendor's own product — resets status to PENDING_REVIEW",
  })
  @ApiOkResponse({ type: ProductResponseDto })
  @ApiNotFoundResponse({ description: 'Product not found' })
  @ApiForbiddenResponse({ description: 'Not your product' })
  update(
    @Req() req: Request,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProductDto,
  ): Promise<ProductResponseDto> {
    const vendorId = req.headers['x-user-id'] as string;
    return this.productService.updateForVendor(id, vendorId, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Soft-delete vendor's own product (status=DELETED)" })
  @ApiNoContentResponse()
  @ApiNotFoundResponse({ description: 'Product not found' })
  @ApiForbiddenResponse({ description: 'Not your product' })
  remove(@Req() req: Request, @Param('id', ParseUUIDPipe) id: string): Promise<void> {
    const vendorId = req.headers['x-user-id'] as string;
    return this.productService.softDeleteForVendor(id, vendorId);
  }

  @Post(':id/images')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FileInterceptor('image', {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  @ApiOperation({ summary: 'Upload product image (FULL + THUMBNAIL variants)' })
  @ApiConsumes('multipart/form-data')
  @ApiCreatedResponse({ description: 'Image uploaded successfully' })
  @ApiNotFoundResponse({ description: 'Product not found' })
  @ApiForbiddenResponse({ description: 'Not your product' })
  uploadImage(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: Request,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<ProductImageEntity> {
    const vendorId = req.headers['x-user-id'] as string;
    return this.imageUploadService.uploadProductImage(id, vendorId, file);
  }
}
