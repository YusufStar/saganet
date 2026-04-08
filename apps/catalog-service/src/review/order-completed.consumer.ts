import { Injectable, Logger, OnModuleInit, OnModuleDestroy, Inject } from '@nestjs/common';
import { Kafka, Consumer } from 'kafkajs';
import { KAFKA_CLIENT } from '@saganet/kafka';
import { ReviewService } from './review.service';

interface OrderCompletedPayload {
  orderId: string;
  userId: string;
  items: Array<{ productId: string }>;
}

@Injectable()
export class OrderCompletedConsumer implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(OrderCompletedConsumer.name);
  private consumer: Consumer;

  constructor(
    @Inject(KAFKA_CLIENT) private readonly kafka: Kafka,
    private readonly reviewService: ReviewService,
  ) {}

  async onModuleInit(): Promise<void> {
    this.consumer = this.kafka.consumer({ groupId: 'catalog-service-order-completed' });
    await this.consumer.connect();
    await this.consumer.subscribe({ topic: 'order.completed', fromBeginning: false });
    await this.consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const raw = message.value?.toString();
          if (!raw) return;

          const payload = JSON.parse(raw) as { payload?: OrderCompletedPayload } | OrderCompletedPayload;
          const data: OrderCompletedPayload = (payload as any).payload ?? payload;

          const { orderId, userId, items } = data;
          if (!orderId || !userId || !Array.isArray(items)) return;

          await Promise.all(
            items.map((item) =>
              this.reviewService.recordPurchase(userId, item.productId, orderId),
            ),
          );

          this.logger.log(`Recorded ${items.length} purchases for userId=${userId} orderId=${orderId}`);

          await this.consumer.commitOffsets([
            { topic, partition, offset: (BigInt(message.offset) + BigInt(1)).toString() },
          ]);
        } catch (err) {
          this.logger.error('Failed to process order.completed', err);
        }
      },
    });
  }

  async onModuleDestroy(): Promise<void> {
    await this.consumer?.disconnect();
  }
}
