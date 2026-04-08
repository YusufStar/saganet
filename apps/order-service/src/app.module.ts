import * as path from 'path';
import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule, OutboxEntity } from '@saganet/db';
import { RedisModule } from '@saganet/redis';
import { KafkaModule } from '@saganet/kafka';
import { OrderEntity } from './order/order.entity';
import { OrderItemEntity } from './order/order-item.entity';
import { SagaStateEntity } from './saga/saga-state.entity';
import { InternalAuthMiddleware } from './common/middleware/internal-auth.middleware';
import { HealthModule } from './health/health.module';
import { MetricsModule } from './metrics/metrics.module';
import { OrderModule } from './order/order.module';
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
      entities: [OrderEntity, OrderItemEntity, SagaStateEntity, OutboxEntity],
    }),
    RedisModule.forRoot(),
    KafkaModule.forRoot({ clientId: 'order-service' }),
    HealthModule,
    MetricsModule,
    OrderModule,
    OutboxModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(InternalAuthMiddleware).forRoutes({ path: '{*path}', method: RequestMethod.ALL });
  }
}
