import * as path from 'path';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '@saganet/db';
import { CategoryEntity } from './category/category.entity';
import { ProductEntity } from './product/product.entity';
import { ProductImageEntity } from './product/product-image.entity';
import { ProductModule } from './product/product.module';
import { CategoryModule } from './category/category.module';

const envFilePath = [
  path.join(__dirname, '../../../.env'),
  path.join(process.cwd(), '../../.env'),
  '.env',
];

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath }),
    DatabaseModule.forRoot({
      entities: [CategoryEntity, ProductEntity, ProductImageEntity],
    }),
    ProductModule,
    CategoryModule,
  ],
})
export class AppModule {}
