import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '@saganet/db';
import { RedisModule } from '@saganet/redis';
import { KafkaModule } from '@saganet/kafka';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule.forRoot(),
    RedisModule.forRoot(),
    KafkaModule.forRoot({ clientId: 'auth-service' }),
  ],
})
export class AppModule {}
