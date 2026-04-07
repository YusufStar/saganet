import * as path from 'path';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule, OutboxEntity } from '@saganet/db';
import { RedisModule } from '@saganet/redis';
import { KafkaModule } from '@saganet/kafka';
import { UserEntity } from './users/user.entity';
import { UserSessionEntity } from './users/user-session.entity';
import { UserOAuthAccountEntity } from './users/user-oauth-account.entity';
import { AuthModule } from './auth/auth.module';

const envFilePath = [
  path.join(__dirname, '../../../.env'),
  path.join(process.cwd(), '../../.env'),
  '.env',
];

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath }),
    DatabaseModule.forRoot({
      entities: [UserEntity, UserSessionEntity, UserOAuthAccountEntity, OutboxEntity],
    }),
    RedisModule.forRoot(),
    KafkaModule.forRoot({ clientId: 'auth-service' }),
    AuthModule,
  ],
})
export class AppModule {}
