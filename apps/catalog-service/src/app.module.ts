import * as path from 'path';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '@saganet/db';
import { StorageModule } from '@saganet/storage';
import { RedisModule } from '@saganet/redis';
import { KafkaModule } from '@saganet/kafka';
import { CategoryEntity } from './category/category.entity';
import { ProductEntity } from './product/product.entity';
import { ProductImageEntity } from './product/product-image.entity';
import { ProductModule } from './product/product.module';
import { CategoryModule } from './category/category.module';
import { VendorProductModule } from './vendor/vendor-product.module';
import { HealthModule } from './health/health.module';
import { MetricsModule } from './metrics/metrics.module';

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
    StorageModule.forRoot(),
    RedisModule.forRoot(),
    KafkaModule.forRoot({ clientId: 'catalog-service' }),
    ProductModule,
    CategoryModule,
    VendorProductModule,
    HealthModule,
    MetricsModule,
  ],
})
export class AppModule {}
