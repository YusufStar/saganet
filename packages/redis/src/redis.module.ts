import {
  DynamicModule,
  Inject,
  Injectable,
  Module,
  OnApplicationShutdown,
} from '@nestjs/common';
import { createRedisClient, RedisClient, RedisConfig } from './redis.client';

export const REDIS_CLIENT = 'REDIS_CLIENT';

@Injectable()
class RedisShutdownService implements OnApplicationShutdown {
  constructor(@Inject(REDIS_CLIENT) private readonly redis: RedisClient) {}

  async onApplicationShutdown(): Promise<void> {
    if (this.redis.status !== 'end') {
      await this.redis.quit();
    }
  }
}

@Module({})
export class RedisModule {
  static forRoot(config: RedisConfig = {}): DynamicModule {
    const redisProvider = {
      provide: REDIS_CLIENT,
      useFactory: (): RedisClient => createRedisClient(config),
    };

    return {
      module: RedisModule,
      global: true,
      providers: [redisProvider, RedisShutdownService],
      exports: [REDIS_CLIENT],
    };
  }
}
