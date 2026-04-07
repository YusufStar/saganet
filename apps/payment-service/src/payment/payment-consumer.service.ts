import { Inject, Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { KAFKA_CLIENT } from '@saganet/kafka';
import { Consumer, Kafka } from 'kafkajs';
import { PaymentService } from './payment.service';

@Injectable()
export class PaymentConsumerService implements OnModuleInit, OnModuleDestroy {
  private consumer: Consumer;

  constructor(
    @Inject(KAFKA_CLIENT) private readonly kafka: Kafka,
    private readonly paymentService: PaymentService,
  ) {}

  async onModuleInit(): Promise<void> {
    this.consumer = this.kafka.consumer({ groupId: 'payment-service-saga' });
    await this.consumer.connect();
    await this.consumer.subscribe({
      topics: ['payment.charge', 'payment.refund'],
      fromBeginning: false,
    });
    await this.consumer.run({
      eachMessage: async ({ topic, message }) => {
        try {
          const body = JSON.parse(message.value?.toString() ?? '{}');
          const payload = body.payload ?? body;
          if (topic === 'payment.charge') {
            await this.paymentService.charge(payload.orderId, payload.userId, payload.amount);
          } else if (topic === 'payment.refund') {
            await this.paymentService.refund(payload.orderId);
          }
        } catch (err) {
          console.error(`Failed to process ${topic}`, err);
        }
      },
    });
  }

  async onModuleDestroy(): Promise<void> {
    await this.consumer?.disconnect();
  }
}
