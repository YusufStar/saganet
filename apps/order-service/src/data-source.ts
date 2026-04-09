import 'reflect-metadata';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import { OrderEntity } from './order/order.entity';
import { OrderItemEntity } from './order/order-item.entity';
import { SagaStateEntity } from './saga/saga-state.entity';
import { OutboxEntity } from '@saganet/db';

// Monorepo kökündeki .env'i yükle (apps/order-service/src → ../../../ = root)
dotenv.config({ path: path.join(__dirname, '../../../.env') });
dotenv.config(); // fallback: cwd'deki .env

const databaseUrl = process.env.DATABASE_URL;

const AppDataSource = databaseUrl
  ? new DataSource({
      type: 'postgres',
      url: databaseUrl,
      entities: [OrderEntity, OrderItemEntity, SagaStateEntity, OutboxEntity],
      migrations: [process.env.NODE_ENV === 'production' ? 'dist/migrations/*.js' : 'src/migrations/*.ts'],
      synchronize: false,
    })
  : new DataSource({
      type: 'postgres',
      host: process.env.DB_HOST ?? 'localhost',
      port: parseInt(process.env.DB_PORT ?? '5432', 10),
      username: process.env.DB_USERNAME ?? 'postgres',
      password: process.env.DB_PASSWORD ?? 'postgres',
      database: process.env.DB_NAME ?? 'saganet',
      entities: [OrderEntity, OrderItemEntity, SagaStateEntity, OutboxEntity],
      migrations: [process.env.NODE_ENV === 'production' ? 'dist/migrations/*.js' : 'src/migrations/*.ts'],
      synchronize: false,
    });

export default AppDataSource;
