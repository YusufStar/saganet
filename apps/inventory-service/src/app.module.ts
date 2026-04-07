import * as path from 'path';
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule, OutboxEntity } from '@saganet/db';
import { RedisModule } from '@saganet/redis';
import { KafkaModule } from '@saganet/kafka';
import { InventoryEntity } from './inventory/inventory.entity';
import { StockLedgerEntity } from './inventory/stock-ledger.entity';
import { InternalAuthMiddleware } from './common/middleware/internal-auth.middleware';
import { HealthModule } from './health/health.module';
import { MetricsModule } from './metrics/metrics.module';
import { InventoryModule } from './inventory/inventory.module';
import { OutboxModule } from './outbox/outbox.module';

const envFilePath = [
  path.join(__dirname, '../../../.env'),
  path.join(process.cwd(), '../../.env'),
  '.env',
];

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath }),
    DatabaseModule.forRoot({
      entities: [InventoryEntity, StockLedgerEntity, OutboxEntity],
    }),
    RedisModule.forRoot(),
    KafkaModule.forRoot({ clientId: 'inventory-service' }),
    HealthModule,
    MetricsModule,
    InventoryModule,
    OutboxModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(InternalAuthMiddleware).forRoutes('*');
  }
}
