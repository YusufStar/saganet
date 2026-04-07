import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationProcessor } from './notification.queue';
import { MetricsModule } from '../metrics/metrics.module';

@Module({
  imports: [MetricsModule],
  providers: [NotificationService, NotificationProcessor],
})
export class NotificationModule {}
