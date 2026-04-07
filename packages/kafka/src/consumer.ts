import { Kafka, Consumer, EachMessagePayload } from 'kafkajs';
import { recordConsume } from './kafka.metrics';

export type MessageHandler = (payload: EachMessagePayload) => Promise<void>;

export class KafkaConsumer {
  private consumer: Consumer;
  private handlers: Map<string, MessageHandler> = new Map();

  constructor(kafka: Kafka, groupId: string) {
    this.consumer = kafka.consumer({ groupId });
  }

  async connect(): Promise<void> {
    await this.consumer.connect();
  }

  async disconnect(): Promise<void> {
    await this.consumer.stop();
    await this.consumer.disconnect();
  }

  subscribe(topic: string, handler: MessageHandler): void {
    this.handlers.set(topic, handler);
  }

  async run(): Promise<void> {
    const topics = Array.from(this.handlers.keys());
    await this.consumer.subscribe({ topics, fromBeginning: false });
    await this.consumer.run({
      autoCommit: false,
      eachMessage: async ({ topic, partition, message, heartbeat, pause }) => {
        const handler = this.handlers.get(topic);
        if (!handler) return;

        const start = performance.now();
        await handler({ topic, partition, message, heartbeat, pause } as EachMessagePayload);
        const duration = performance.now() - start;
        recordConsume(topic, duration);

        // Manual commit after successful processing (at-least-once guarantee)
        await this.consumer.commitOffsets([{
          topic,
          partition,
          offset: (BigInt(message.offset) + BigInt(1)).toString(),
        }]);
      },
    });
  }
}
