import 'reflect-metadata';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import { NotificationEntity } from './notification/notification.entity';
import { NotificationPreferenceEntity } from './notification/notification-preference.entity';

dotenv.config({ path: path.join(__dirname, '../../../.env') });
dotenv.config();

const databaseUrl = process.env.DATABASE_URL;

const AppDataSource = databaseUrl
  ? new DataSource({
      type: 'postgres',
      url: databaseUrl,
      entities: [NotificationEntity, NotificationPreferenceEntity],
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
      entities: [NotificationEntity, NotificationPreferenceEntity],
      migrations: ['src/migrations/*.ts'],
      synchronize: false,
    });

export default AppDataSource;
