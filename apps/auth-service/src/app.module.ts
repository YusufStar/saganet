import * as path from 'path';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '@saganet/db';
import { RedisModule } from '@saganet/redis';
import { KafkaModule } from '@saganet/kafka';
import { UserEntity } from './users/user.entity';
import { UserSessionEntity } from './users/user-session.entity';
import { UserOAuthAccountEntity } from './users/user-oauth-account.entity';

// Monorepo kökündeki .env dosyasını yükle, yoksa yerel .env'e düş
const envFilePath = [
  path.join(__dirname, '../../../.env'),
  path.join(process.cwd(), '../../.env'),
  '.env',
];

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath }),
    DatabaseModule.forRoot({ entities: [UserEntity, UserSessionEntity, UserOAuthAccountEntity] }),
    RedisModule.forRoot(),
    KafkaModule.forRoot({ clientId: 'auth-service' }),
  ],
})
export class AppModule {}
