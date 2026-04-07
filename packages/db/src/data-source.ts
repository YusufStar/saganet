import { DataSource, DataSourceOptions } from 'typeorm';

export interface DatabaseConfig {
  host?: string;
  port?: number;
  username?: string;
  password?: string;
  database?: string;
  entities?: DataSourceOptions['entities'];
  migrations?: DataSourceOptions['migrations'];
  ssl?: boolean;
  poolSize?: number;
}

export function createDataSource(config: DatabaseConfig = {}): DataSource {
  const ssl = config.ssl ?? process.env.DB_SSL === 'true';

  return new DataSource({
    type: 'postgres',
    host: config.host ?? process.env.DB_HOST ?? 'localhost',
    port: config.port ?? parseInt(process.env.DB_PORT ?? '5432', 10),
    username: config.username ?? process.env.DB_USERNAME ?? 'postgres',
    password: config.password ?? process.env.DB_PASSWORD ?? 'postgres',
    database: config.database ?? process.env.DB_NAME ?? 'saganet',
    entities: config.entities ?? [],
    migrations: config.migrations ?? [],
    ssl: ssl ? { rejectUnauthorized: false } : false,
    extra: {
      max: config.poolSize ?? parseInt(process.env.DB_POOL_MAX ?? '10', 10),
      min: parseInt(process.env.DB_POOL_MIN ?? '2', 10),
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 5_000,
    },
    synchronize: false,
    logging: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : false,
  });
}
