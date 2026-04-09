import 'reflect-metadata';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import { UserEntity } from './users/user.entity';
import { UserSessionEntity } from './users/user-session.entity';
import { UserOAuthAccountEntity } from './users/user-oauth-account.entity';
import { UserAddressEntity } from './users/user-address.entity';
import { VendorApplicationEntity } from './vendor-application/vendor-application.entity';
import { OutboxEntity } from '@saganet/db';

// Monorepo kökündeki .env'i yükle (apps/auth-service/src → ../../../ = root)
dotenv.config({ path: path.join(__dirname, '../../../.env') });
dotenv.config(); // fallback: cwd'deki .env

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: parseInt(process.env.DB_PORT ?? '5432', 10),
  username: process.env.DB_USERNAME ?? 'postgres',
  password: process.env.DB_PASSWORD ?? 'postgres',
  database: process.env.DB_NAME ?? 'saganet',
  entities: [UserEntity, UserSessionEntity, UserOAuthAccountEntity, UserAddressEntity, VendorApplicationEntity, OutboxEntity],
  migrations: [process.env.NODE_ENV === 'production' ? 'dist/migrations/*.js' : 'src/migrations/*.ts'],
  synchronize: false,
});

export default AppDataSource;
