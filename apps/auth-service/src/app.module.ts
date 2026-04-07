import * as path from 'path';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule, OutboxEntity } from '@saganet/db';
import { StorageModule } from '@saganet/storage';
import { RedisModule } from '@saganet/redis';
import { KafkaModule } from '@saganet/kafka';
import { UserEntity } from './users/user.entity';
import { UserSessionEntity } from './users/user-session.entity';
import { UserOAuthAccountEntity } from './users/user-oauth-account.entity';
import { UserAddressEntity } from './users/user-address.entity';
import { AuthModule } from './auth/auth.module';
import { OutboxModule } from './outbox/outbox.module';
import { HealthModule } from './health/health.module';
import { MetricsModule } from './metrics/metrics.module';
import { ProfileModule } from './profile/profile.module';
import { AddressModule } from './address/address.module';

const envFilePath = [
  path.join(__dirname, '../../../.env'),
  path.join(process.cwd(), '../../.env'),
  '.env',
];

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath }),
    DatabaseModule.forRoot({
      entities: [UserEntity, UserSessionEntity, UserOAuthAccountEntity, OutboxEntity, UserAddressEntity],
    }),
    StorageModule.forRoot(),
    RedisModule.forRoot(),
    KafkaModule.forRoot({ clientId: 'auth-service' }),
    AuthModule,
    OutboxModule,
    HealthModule,
    MetricsModule,
    ProfileModule,
    AddressModule,
  ],
})
export class AppModule {}
