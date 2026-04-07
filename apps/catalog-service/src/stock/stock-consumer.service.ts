import { Injectable, Logger, OnModuleInit, OnModuleDestroy, Inject } from '@nestjs/common';
import { Kafka, Consumer } from 'kafkajs';
import { KAFKA_CLIENT } from '@saganet/kafka';

@Injectable()
export class StockConsumerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(StockConsumerService.name);
  private consumer: Consumer;

  constructor(@Inject(KAFKA_CLIENT) private readonly kafka: Kafka) {}

  async onModuleInit(): Promise<void> {
    this.consumer = this.kafka.consumer({ groupId: 'catalog-service-stock' });
    await this.consumer.connect();
    await this.consumer.subscribe({ topic: 'stock.updated', fromBeginning: false });
    await this.consumer.run({
      eachMessage: async ({ message }) => {
        try {
          const payload = JSON.parse(message.value?.toString() ?? '{}');
          this.logger.log(`stock.updated received: productId=${payload?.payload?.productId}`);
          // Future: update cached stock availability in Redis
        } catch (err) {
          this.logger.error('Failed to process stock.updated', err);
        }
      },
    });
  }

  async onModuleDestroy(): Promise<void> {
    await this.consumer?.disconnect();
  }
}
