import Redis from 'ioredis';

export type RedisClient = Redis;

export interface RedisConfig {
  host?: string;
  port?: number;
  password?: string;
  db?: number;
  keyPrefix?: string;
  connectTimeout?: number;
  maxRetriesPerRequest?: number;
}

export function createRedisClient(config: RedisConfig = {}): RedisClient {
  return new Redis({
    host: config.host ?? process.env.REDIS_HOST ?? 'localhost',
    port: config.port ?? parseInt(process.env.REDIS_PORT ?? '6379', 10),
    password: config.password ?? process.env.REDIS_PASSWORD ?? undefined,
    db: config.db ?? parseInt(process.env.REDIS_DB ?? '0', 10),
    keyPrefix: config.keyPrefix ?? process.env.REDIS_KEY_PREFIX ?? undefined,
    connectTimeout: config.connectTimeout ?? 5_000,
    maxRetriesPerRequest: config.maxRetriesPerRequest ?? 3,
    enableReadyCheck: true,
    lazyConnect: false,
  });
}
