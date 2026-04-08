import 'reflect-metadata';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import { CategoryEntity } from './category/category.entity';
import { ProductEntity } from './product/product.entity';
import { ProductImageEntity } from './product/product-image.entity';
import { ReviewEntity } from './review/review.entity';
import { UserPurchasedProductEntity } from './review/user-purchased-product.entity';

// Monorepo kökündeki .env'i yükle (apps/catalog-service/src → ../../../ = root)
dotenv.config({ path: path.join(__dirname, '../../../.env') });
dotenv.config(); // fallback: cwd'deki .env

const databaseUrl = process.env.DATABASE_URL;
const entities = [CategoryEntity, ProductEntity, ProductImageEntity, ReviewEntity, UserPurchasedProductEntity];

const AppDataSource = databaseUrl
  ? new DataSource({
      type: 'postgres',
      url: databaseUrl,
      entities,
      migrations: ['src/migrations/*.ts'],
      synchronize: false,
    })
  : new DataSource({
      type: 'postgres',
      host: process.env.DB_HOST ?? 'localhost',
      port: parseInt(process.env.DB_PORT ?? '5432', 10),
      username: process.env.DB_USERNAME ?? 'postgres',
      password: process.env.DB_PASSWORD ?? 'postgres',
      database: process.env.DB_NAME ?? 'saganet',
      entities,
      migrations: ['src/migrations/*.ts'],
      synchronize: false,
    });

export default AppDataSource;
