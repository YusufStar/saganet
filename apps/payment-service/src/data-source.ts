import 'reflect-metadata';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import { PaymentEntity } from './payment/payment.entity';
import { OutboxEntity } from '@saganet/db';

// Monorepo kökündeki .env'i yükle (apps/payment-service/src → ../../../ = root)
dotenv.config({ path: path.join(__dirname, '../../../.env') });
dotenv.config(); // fallback: cwd'deki .env

const databaseUrl = process.env.DATABASE_URL;

const AppDataSource = databaseUrl
  ? new DataSource({
      type: 'postgres',
      url: databaseUrl,
      entities: [PaymentEntity, OutboxEntity],
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
      entities: [PaymentEntity, OutboxEntity],
      migrations: [process.env.NODE_ENV === 'production' ? 'dist/migrations/*.js' : 'src/migrations/*.ts'],
      synchronize: false,
    });

export default AppDataSource;
