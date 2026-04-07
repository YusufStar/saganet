import { Injectable, OnModuleInit } from '@nestjs/common';
import { Counter, Histogram, Registry } from 'prom-client';

@Injectable()
export class MetricsService implements OnModuleInit {
  readonly registry = new Registry();
  notificationsSent: Counter;
  notificationsFailed: Counter;
  notificationDuration: Histogram;

  onModuleInit() {
    this.notificationsSent = new Counter({
      name: 'notification_sent_total',
      help: 'Total sent notifications',
      labelNames: ['type'],
      registers: [this.registry],
    });
    this.notificationsFailed = new Counter({
      name: 'notification_failed_total',
      help: 'Total failed notifications',
      labelNames: ['type'],
      registers: [this.registry],
    });
    this.notificationDuration = new Histogram({
      name: 'notification_duration_seconds',
      help: 'Time to send notification',
      labelNames: ['type'],
      registers: [this.registry],
    });
  }
}
