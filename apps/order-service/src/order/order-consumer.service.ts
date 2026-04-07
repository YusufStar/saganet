import { Injectable, Logger, OnModuleDestroy, OnModuleInit, Inject } from '@nestjs/common';
import { Kafka, Consumer } from 'kafkajs';
import { KAFKA_CLIENT } from '@saganet/kafka';
import { DATA_SOURCE } from '@saganet/db';
import { DataSource } from 'typeorm';
import { OrderSagaService } from '../saga/order-saga.service';
import { SagaStateEntity } from '../saga/saga-state.entity';

@Injectable()
export class OrderConsumerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(OrderConsumerService.name);
  private consumer: Consumer;

  constructor(
    @Inject(KAFKA_CLIENT) private readonly kafka: Kafka,
    @Inject(DATA_SOURCE) private readonly dataSource: DataSource,
    private readonly sagaService: OrderSagaService,
  ) {}

  async onModuleInit(): Promise<void> {
    this.consumer = this.kafka.consumer({ groupId: 'order-service-saga' });
    await this.consumer.connect();
    await this.consumer.subscribe({
      topics: [
        'inventory.reserved',
        'inventory.reservation-failed',
        'payment.completed',
        'payment.failed',
      ],
      fromBeginning: false,
    });

    await this.consumer.run({
      eachMessage: async ({ topic, message }) => {
        try {
          const raw = message.value?.toString();
          if (!raw) return;
          const body = JSON.parse(raw);
          const payload = body.payload ?? body;
          const { orderId, reason } = payload;

          // Get saga creation time for completion duration metric
          const saga = await this.dataSource
            .getRepository(SagaStateEntity)
            .findOne({ where: { orderId } });
          const startedAt = saga?.createdAt ?? new Date();

          switch (topic) {
            case 'inventory.reserved':
              await this.sagaService.onInventoryReserved(orderId);
              break;
            case 'inventory.reservation-failed':
              await this.sagaService.onInventoryFailed(orderId, reason ?? 'insufficient_stock');
              break;
            case 'payment.completed':
              await this.sagaService.onPaymentCompleted(orderId, startedAt);
              break;
            case 'payment.failed':
              await this.sagaService.onPaymentFailed(orderId, reason ?? 'payment_declined');
              break;
          }
        } catch (err) {
          this.logger.error(`Failed to process ${topic}`, err);
        }
      },
    });
  }

  async onModuleDestroy(): Promise<void> {
    await this.consumer?.disconnect();
  }
}
