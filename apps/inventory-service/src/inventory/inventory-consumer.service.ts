import { Inject, Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { KAFKA_CLIENT } from '@saganet/kafka';
import { Consumer, Kafka } from 'kafkajs';
import { InventoryService } from './inventory.service';

@Injectable()
export class InventoryConsumerService implements OnModuleInit, OnModuleDestroy {
  private consumer: Consumer;

  constructor(
    @Inject(KAFKA_CLIENT) private readonly kafka: Kafka,
    private readonly inventoryService: InventoryService,
  ) {}

  async onModuleInit(): Promise<void> {
    this.consumer = this.kafka.consumer({ groupId: 'inventory-service-saga' });
    await this.consumer.connect();
    await this.consumer.subscribe({
      topics: ['inventory.reserve', 'inventory.release'],
      fromBeginning: false,
    });
    await this.consumer.run({
      eachMessage: async ({ topic, message }) => {
        try {
          const body = JSON.parse(message.value?.toString() ?? '{}');
          const payload = body.payload ?? body;
          if (topic === 'inventory.reserve') {
            await this.inventoryService.reserve(payload.orderId, payload.items);
          } else if (topic === 'inventory.release') {
            await this.inventoryService.release(payload.orderId, payload.items);
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
