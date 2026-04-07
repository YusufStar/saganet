import { Module } from '@nestjs/common';
import { VendorProductController } from './vendor-product.controller';
import { ImageUploadService } from './image-upload.service';
import { ProductModule } from '../product/product.module';

@Module({
  imports: [ProductModule],
  controllers: [VendorProductController],
  providers: [ImageUploadService],
})
export class VendorProductModule {}
