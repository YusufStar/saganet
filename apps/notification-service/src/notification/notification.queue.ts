import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Injectable, Inject, Logger } from '@nestjs/common';
import { MAILER, Mailer } from '@saganet/smtp';

export const NOTIFICATION_QUEUE = 'notifications';

export interface NotificationJob {
  to: string;
  subject: string;
  html: string;
  type: string;
  userId?: string;
}

@Processor(NOTIFICATION_QUEUE)
@Injectable()
export class NotificationProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationProcessor.name);

  constructor(@Inject(MAILER) private readonly mailer: Mailer) {
    super();
  }

  async process(job: Job<NotificationJob>): Promise<void> {
    const { to, subject, html } = job.data;
    await this.mailer.send({ to, subject, html });
    this.logger.log(`[${job.id}] Email sent to ${to} — type: ${job.data.type}`);
  }
}
