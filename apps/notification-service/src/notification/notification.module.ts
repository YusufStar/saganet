import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { NotificationService } from './notification.service';
import { NotificationProcessor, NOTIFICATION_QUEUE } from './notification.queue';
import { MetricsModule } from '../metrics/metrics.module';

@Module({
  imports: [MetricsModule, BullModule.registerQueue({ name: NOTIFICATION_QUEUE })],
  providers: [NotificationService, NotificationProcessor],
})
export class NotificationModule {}
