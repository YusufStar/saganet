import * as path from 'path';
import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
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
import { AdminModule } from './admin/admin.module';
import { StockModule } from './stock/stock.module';
import { ReviewModule } from './review/review.module';
import { ReviewEntity } from './review/review.entity';
import { UserPurchasedProductEntity } from './review/user-purchased-product.entity';
import { InternalAuthMiddleware } from './common/middleware/internal-auth.middleware';

const envFilePath = [
  path.join(__dirname, '../../../.env'),
  path.join(process.cwd(), '../../.env'),
  '.env',
];

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath }),
    ThrottlerModule.forRoot([
      {
        name: 'vendor_product_create',
        ttl: 60 * 60 * 1000,
        limit: 100,
      },
    ]),
    DatabaseModule.forRoot({
      entities: [CategoryEntity, ProductEntity, ProductImageEntity, ReviewEntity, UserPurchasedProductEntity],
    }),
    StorageModule.forRoot(),
    RedisModule.forRoot(),
    KafkaModule.forRoot({ clientId: 'catalog-service' }),
    ProductModule,
    CategoryModule,
    VendorProductModule,
    HealthModule,
    MetricsModule,
    AdminModule,
    StockModule,
    ReviewModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(InternalAuthMiddleware).forRoutes({ path: '{*path}', method: RequestMethod.ALL });
  }
}
