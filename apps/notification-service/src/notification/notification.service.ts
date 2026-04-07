import { Inject, Injectable, Logger, OnApplicationBootstrap, OnApplicationShutdown } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Kafka } from 'kafkajs';
import { KAFKA_CLIENT, KafkaConsumer } from '@saganet/kafka';
import { MAILER, Mailer, welcomeTemplate, verifyEmailTemplate } from '@saganet/smtp';
import { KAFKA_TOPICS } from '@saganet/common';

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

@Injectable()
export class NotificationService implements OnApplicationBootstrap, OnApplicationShutdown {
  private readonly logger = new Logger(NotificationService.name);
  private consumer: KafkaConsumer;

  constructor(
    @Inject(KAFKA_CLIENT) private readonly kafka: Kafka,
    @Inject(MAILER) private readonly mailer: Mailer,
    private readonly config: ConfigService,
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

    await this.consumer.run();
    this.logger.log('Kafka consumer started');
  }

  async onApplicationShutdown(): Promise<void> {
    await this.consumer.disconnect();
  }

  private async handleUserRegistered(payload: UserRegisteredPayload): Promise<void> {
    const baseUrl = this.config.get<string>('APP_BASE_URL', 'http://localhost:3000');
    const verificationUrl = `${baseUrl}/api/auth/verify-email?token=${payload.verificationToken}`;

    const template = verifyEmailTemplate({ email: payload.email, verificationUrl });
    await this.mailer.send({ to: payload.email, ...template });
    this.logger.log(`Verification email sent to ${payload.email}`);
  }

  private async handleUserEmailVerified(payload: UserEmailVerifiedPayload): Promise<void> {
    const template = welcomeTemplate({ email: payload.email });
    await this.mailer.send({ to: payload.email, ...template });
    this.logger.log(`Welcome email sent to ${payload.email}`);
  }
}
