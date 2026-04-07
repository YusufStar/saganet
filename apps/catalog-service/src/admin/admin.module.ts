import { Module } from '@nestjs/common';
import { ProductModule } from '../product/product.module';
import { CategoryModule } from '../category/category.module';
import { AdminProductController } from './admin-product.controller';
import { AdminCategoryController } from './admin-category.controller';

@Module({
  imports: [ProductModule, CategoryModule],
  controllers: [AdminProductController, AdminCategoryController],
})
export class AdminModule {}
