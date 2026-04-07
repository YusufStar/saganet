import { Inject, Injectable, Logger } from '@nestjs/common';
import { Kafka } from 'kafkajs';
import { KAFKA_CLIENT } from '@saganet/kafka';
import { ProductEntity } from './product.entity';
import { randomUUID } from 'crypto';

@Injectable()
export class ProductEventsService {
  private readonly logger = new Logger(ProductEventsService.name);

  constructor(@Inject(KAFKA_CLIENT) private readonly kafka: Kafka) {}

  async emitProductCreated(product: ProductEntity): Promise<void> {
    await this.send('product.created', 'product.created', {
      productId: product.id,
      vendorId: product.vendorId,
      name: product.name,
      price: product.price,
      categoryId: product.categoryId,
      slug: product.slug,
    });
  }

  async emitProductDeleted(productId: string, vendorId: string): Promise<void> {
    await this.send('product.deleted', 'product.deleted', { productId, vendorId });
  }

  async emitProductPriceChanged(
    productId: string,
    oldPrice: string,
    newPrice: string,
    vendorId: string,
  ): Promise<void> {
    await this.send('product.price-changed', 'product.price-changed', {
      productId,
      vendorId,
      oldPrice,
      newPrice,
    });
  }

  private async send(topic: string, type: string, payload: unknown): Promise<void> {
    try {
      const producer = this.kafka.producer();
      await producer.connect();
      await producer.send({
        topic,
        messages: [
          {
            key: randomUUID(),
            value: JSON.stringify({
              eventId: randomUUID(),
              type,
              timestamp: new Date().toISOString(),
              payload,
            }),
          },
        ],
      });
      await producer.disconnect();
    } catch (err) {
      this.logger.error(`Failed to emit ${type}`, err);
    }
  }
}
