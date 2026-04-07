import 'reflect-metadata';
import * as path from 'path';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { KafkaModule } from '@saganet/kafka';
import { MailerModule } from '@saganet/smtp';
import { NotificationModule } from './notification/notification.module';
import { NotificationEntity } from './notification/notification.entity';
import { NotificationPreferenceEntity } from './notification/notification-preference.entity';
import { HealthModule } from './health/health.module';
import { MetricsModule } from './metrics/metrics.module';
import { NOTIFICATION_QUEUE } from './notification/notification.queue';

const envFilePath = [
  path.join(__dirname, '../../../.env'),
  path.join(process.cwd(), '../../.env'),
  '.env',
];

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        type: 'postgres' as const,
        host: config.get<string>('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 5432),
        username: config.get<string>('DB_USERNAME', 'postgres'),
        password: config.get<string>('DB_PASSWORD', 'postgres'),
        database: config.get<string>('DB_NAME', 'saganet'),
        entities: [NotificationEntity, NotificationPreferenceEntity],
        migrations: [],
        synchronize: false,
      }),
      inject: [ConfigService],
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        connection: {
          host: config.get('REDIS_HOST', 'localhost'),
          port: config.get<number>('REDIS_PORT', 6379),
        },
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue({ name: NOTIFICATION_QUEUE }),
    KafkaModule.forRoot({ clientId: 'notification-service' }),
    MailerModule.forRoot(),
    HealthModule,
    MetricsModule,
    NotificationModule,
  ],
})
export class AppModule {}
