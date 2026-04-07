import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { ProductEventsService } from './product-events.service';
import { ProductCacheService } from './product-cache.service';

@Module({
  providers: [ProductService, ProductEventsService, ProductCacheService],
  controllers: [ProductController],
  exports: [ProductService, ProductEventsService, ProductCacheService],
})
export class ProductModule {}
