import 'reflect-metadata';
import * as path from 'path';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { KafkaModule } from '@saganet/kafka';
import { MailerModule } from '@saganet/smtp';
import { NotificationModule } from './notification/notification.module';

const envFilePath = [
  path.join(__dirname, '../../../.env'),
  path.join(process.cwd(), '../../.env'),
  '.env',
];

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath }),
    KafkaModule.forRoot({ clientId: 'notification-service' }),
    MailerModule.forRoot(),
    NotificationModule,
  ],
})
export class AppModule {}
