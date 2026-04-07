import { Kafka, Consumer, EachMessagePayload } from 'kafkajs';

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
      eachMessage: async (payload) => {
        const handler = this.handlers.get(payload.topic);
        if (handler) await handler(payload);
      },
    });
  }
}
