import { Inject, Injectable, Logger, OnApplicationBootstrap, OnApplicationShutdown } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Kafka } from 'kafkajs';
import { KAFKA_CLIENT, KafkaConsumer } from '@saganet/kafka';
import {
  verifyEmailTemplate,
  welcomeTemplate,
  orderCreatedTemplate,
  orderCompletedTemplate,
  orderFailedTemplate,
  paymentCompletedTemplate,
  paymentRefundedTemplate,
  passwordResetTemplate,
} from '@saganet/smtp';
import { KAFKA_TOPICS } from '@saganet/common';
import { MetricsService } from '../metrics/metrics.service';
import { NOTIFICATION_QUEUE, NotificationJob } from './notification.queue';

interface UserRegisteredPayload {
  userId: string;
  email: string;
  role: string;
  verificationToken: string;
}

interface UserEmailVerifiedPayload {
  userId: string;
  email: string;
}

interface OrderCreatedPayload {
  orderId: string;
  userId: string;
  userEmail: string;
  totalAmount: number;
  currency: string;
}

interface OrderCompletedPayload {
  orderId: string;
  userId: string;
  userEmail: string;
}

interface OrderFailedPayload {
  orderId: string;
  userId: string;
  userEmail: string;
  reason?: string;
}

interface PaymentCompletedPayload {
  orderId: string;
  userId: string;
  userEmail: string;
  amount: number;
  currency: string;
}

interface PaymentRefundedPayload {
  orderId: string;
  userId: string;
  userEmail: string;
  amount: number;
  currency: string;
}

interface PasswordResetRequestedPayload {
  userId: string;
  email: string;
  resetToken: string;
}

@Injectable()
export class NotificationService implements OnApplicationBootstrap, OnApplicationShutdown {
  private readonly logger = new Logger(NotificationService.name);
  private consumer: KafkaConsumer;

  constructor(
    @Inject(KAFKA_CLIENT) private readonly kafka: Kafka,
    @InjectQueue(NOTIFICATION_QUEUE) private readonly notificationQueue: Queue<NotificationJob>,
    private readonly config: ConfigService,
    private readonly metrics: MetricsService,
  ) {
    this.consumer = new KafkaConsumer(kafka, 'notification-service');
  }

  async onApplicationBootstrap(): Promise<void> {
    await this.consumer.connect();

    this.consumer.subscribe(KAFKA_TOPICS.USER_REGISTERED, async (payload) => {
      try {
        const event: UserRegisteredPayload = JSON.parse(
          payload.message.value?.toString() ?? '{}',
        );
        await this.handleUserRegistered(event);
      } catch (err) {
        this.logger.error('Failed to handle user.registered', err);
      }
    });

    this.consumer.subscribe(KAFKA_TOPICS.USER_EMAIL_VERIFIED, async (payload) => {
      try {
        const event: UserEmailVerifiedPayload = JSON.parse(
          payload.message.value?.toString() ?? '{}',
        );
        await this.handleUserEmailVerified(event);
      } catch (err) {
        this.logger.error('Failed to handle user.email-verified', err);
      }
    });

    this.consumer.subscribe(KAFKA_TOPICS.ORDER_CREATED, async (payload) => {
      try {
        const event: OrderCreatedPayload = JSON.parse(
          payload.message.value?.toString() ?? '{}',
        );
        await this.handleOrderCreated(event);
      } catch (err) {
        this.logger.error('Failed to handle order.created', err);
      }
    });

    this.consumer.subscribe(KAFKA_TOPICS.ORDER_COMPLETED, async (payload) => {
      try {
        const event: OrderCompletedPayload = JSON.parse(
          payload.message.value?.toString() ?? '{}',
        );
        await this.handleOrderCompleted(event);
      } catch (err) {
        this.logger.error('Failed to handle order.completed', err);
      }
    });

    this.consumer.subscribe(KAFKA_TOPICS.ORDER_FAILED, async (payload) => {
      try {
        const event: OrderFailedPayload = JSON.parse(
          payload.message.value?.toString() ?? '{}',
        );
        await this.handleOrderFailed(event);
      } catch (err) {
        this.logger.error('Failed to handle order.failed', err);
      }
    });

    this.consumer.subscribe(KAFKA_TOPICS.PAYMENT_COMPLETED, async (payload) => {
      try {
        const event: PaymentCompletedPayload = JSON.parse(
          payload.message.value?.toString() ?? '{}',
        );
        await this.handlePaymentCompleted(event);
      } catch (err) {
        this.logger.error('Failed to handle payment.completed', err);
      }
    });

    this.consumer.subscribe(KAFKA_TOPICS.PAYMENT_REFUNDED, async (payload) => {
      try {
        const event: PaymentRefundedPayload = JSON.parse(
          payload.message.value?.toString() ?? '{}',
        );
        await this.handlePaymentRefunded(event);
      } catch (err) {
        this.logger.error('Failed to handle payment.refunded', err);
      }
    });

    this.consumer.subscribe(KAFKA_TOPICS.USER_PASSWORD_RESET_REQUESTED, async (payload) => {
      try {
        const event: PasswordResetRequestedPayload = JSON.parse(
          payload.message.value?.toString() ?? '{}',
        );
        await this.handlePasswordResetRequested(event);
      } catch (err) {
        this.logger.error('Failed to handle user.password-reset-requested', err);
      }
    });

    await this.consumer.run();
    this.logger.log('Kafka consumer started');
  }

  async onApplicationShutdown(): Promise<void> {
    await this.consumer.disconnect();
  }

  private async enqueue(type: string, to: string, template: { subject: string; html: string }, userId?: string): Promise<void> {
    try {
      await this.notificationQueue.add(type, { to, subject: template.subject, html: template.html, type, userId });
      this.metrics.notificationsSent.inc({ type });
      this.logger.log(`Enqueued ${type} notification for ${to}`);
    } catch (err) {
      this.metrics.notificationsFailed.inc({ type });
      this.logger.error(`Failed to enqueue ${type} notification for ${to}`, err);
    }
  }

  private async handleUserRegistered(payload: UserRegisteredPayload): Promise<void> {
    const baseUrl = this.config.get<string>('APP_BASE_URL', 'http://localhost:3000');
    const verificationUrl = `${baseUrl}/api/auth/verify-email?token=${payload.verificationToken}`;
    const template = verifyEmailTemplate({ email: payload.email, verificationUrl });
    await this.enqueue('user.registered', payload.email, template, payload.userId);
  }

  private async handleUserEmailVerified(payload: UserEmailVerifiedPayload): Promise<void> {
    const template = welcomeTemplate({ email: payload.email });
    await this.enqueue('user.email-verified', payload.email, template, payload.userId);
  }

  private async handleOrderCreated(payload: OrderCreatedPayload): Promise<void> {
    const template = orderCreatedTemplate({
      email: payload.userEmail,
      orderId: payload.orderId,
      totalAmount: payload.totalAmount,
      currency: payload.currency,
    });
    await this.enqueue('order.created', payload.userEmail, template, payload.userId);
  }

  private async handleOrderCompleted(payload: OrderCompletedPayload): Promise<void> {
    const template = orderCompletedTemplate({
      email: payload.userEmail,
      orderId: payload.orderId,
    });
    await this.enqueue('order.completed', payload.userEmail, template, payload.userId);
  }

  private async handleOrderFailed(payload: OrderFailedPayload): Promise<void> {
    const template = orderFailedTemplate({
      email: payload.userEmail,
      orderId: payload.orderId,
      reason: payload.reason,
    });
    await this.enqueue('order.failed', payload.userEmail, template, payload.userId);
  }

  private async handlePaymentCompleted(payload: PaymentCompletedPayload): Promise<void> {
    const template = paymentCompletedTemplate({
      email: payload.userEmail,
      orderId: payload.orderId,
      amount: payload.amount,
      currency: payload.currency,
    });
    await this.enqueue('payment.completed', payload.userEmail, template, payload.userId);
  }

  private async handlePaymentRefunded(payload: PaymentRefundedPayload): Promise<void> {
    const template = paymentRefundedTemplate({
      email: payload.userEmail,
      orderId: payload.orderId,
      amount: payload.amount,
      currency: payload.currency,
    });
    await this.enqueue('payment.refunded', payload.userEmail, template, payload.userId);
  }

  private async handlePasswordResetRequested(payload: PasswordResetRequestedPayload): Promise<void> {
    const baseUrl = this.config.get<string>('APP_BASE_URL', 'http://localhost:3000');
    const resetUrl = `${baseUrl}/reset-password?token=${payload.resetToken}`;
    const template = passwordResetTemplate({ email: payload.email, resetUrl });
    await this.enqueue('user.password-reset-requested', payload.email, template, payload.userId);
  }
}
