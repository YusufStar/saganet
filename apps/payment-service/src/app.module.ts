import * as path from 'path';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule, OutboxEntity } from '@saganet/db';
import { RedisModule } from '@saganet/redis';
import { KafkaModule } from '@saganet/kafka';
import { PaymentEntity } from './payment/payment.entity';
import { HealthModule } from './health/health.module';
import { MetricsModule } from './metrics/metrics.module';
import { PaymentModule } from './payment/payment.module';
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
      entities: [PaymentEntity, OutboxEntity],
    }),
    RedisModule.forRoot(),
    KafkaModule.forRoot({ clientId: 'payment-service' }),
    HealthModule,
    MetricsModule,
    PaymentModule,
    OutboxModule,
  ],
})
export class AppModule {}
