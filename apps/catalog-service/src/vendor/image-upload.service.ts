import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { DATA_SOURCE } from '@saganet/db';
import { STORAGE_CLIENT, StorageClient } from '@saganet/storage';
import sharp from 'sharp';
import { ProductEntity } from '../product/product.entity';
import { ProductImageEntity } from '../product/product-image.entity';
import { ImageType } from '../product/image-type.enum';
import { validateImageMagicBytes, imageExt } from '../common/image-magic-bytes';

const ALLOWED_MIMES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

@Injectable()
export class ImageUploadService {
  constructor(
    @Inject(DATA_SOURCE) private readonly dataSource: DataSource,
    @Inject(STORAGE_CLIENT) private readonly storage: StorageClient,
  ) {}

  async uploadProductImage(
    productId: string,
    vendorId: string,
    file: Express.Multer.File,
  ): Promise<ProductImageEntity> {
    // Ownership check
    const productRepo = this.dataSource.getRepository(ProductEntity);
    const product = await productRepo.findOne({ where: { id: productId } });
    if (!product) throw new NotFoundException('Product not found');
    if (product.vendorId !== vendorId) throw new ForbiddenException('Not your product');

    // Validate size
    if (file.size > MAX_SIZE) {
      throw new BadRequestException('File size exceeds 5 MB limit');
    }

    // Validate MIME type
    if (!ALLOWED_MIMES.includes(file.mimetype)) {
      throw new BadRequestException('Only JPEG, PNG and WebP images are allowed');
    }

    // Magic bytes check
    if (!validateImageMagicBytes(file.buffer)) {
      throw new BadRequestException('File content does not match an allowed image type');
    }

    const ext = imageExt(file.buffer);
    const timestamp = Date.now();

    // Resize to FULL (1200px width)
    const fullBuffer = await sharp(file.buffer)
      .resize({ width: 1200, withoutEnlargement: true })
      .toBuffer();

    // Resize to THUMBNAIL (300px width)
    const thumbBuffer = await sharp(file.buffer)
      .resize({ width: 300, withoutEnlargement: true })
      .toBuffer();

    const fullKey = `products/${productId}/full-${timestamp}.${ext}`;
    const thumbKey = `products/${productId}/thumb-${timestamp}.${ext}`;

    const contentType = file.mimetype;

    const fullUrl = await this.storage.upload({ key: fullKey, buffer: fullBuffer, contentType });
    const thumbUrl = await this.storage.upload({ key: thumbKey, buffer: thumbBuffer, contentType });

    // Determine next displayOrder
    const imageRepo = this.dataSource.getRepository(ProductImageEntity);
    const existing = await imageRepo.count({ where: { productId } });

    const fullImage = imageRepo.create({
      productId,
      url: fullUrl,
      type: ImageType.FULL,
      displayOrder: existing,
    });

    const thumbImage = imageRepo.create({
      productId,
      url: thumbUrl,
      type: ImageType.THUMBNAIL,
      displayOrder: existing + 1,
    });

    await imageRepo.save([fullImage, thumbImage]);
    return fullImage;
  }
}
