import { Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { CategorySeeder } from './category.seeder';
import { ProductModule } from '../product/product.module';

@Module({
  imports: [ProductModule],
  providers: [CategoryService, CategorySeeder],
  controllers: [CategoryController],
  exports: [CategoryService],
})
export class CategoryModule {}
