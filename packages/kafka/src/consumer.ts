import { Kafka, Consumer, Producer, EachMessagePayload } from 'kafkajs';
import { recordConsume } from './kafka.metrics';

export type MessageHandler = (payload: EachMessagePayload) => Promise<void>;

export interface KafkaConsumerOptions {
  /** Max handler retries before sending to DLQ (default: 3) */
  maxRetries?: number;
  /** Base delay between retries in ms (default: 500) */
  retryBaseDelay?: number;
}

export class KafkaConsumer {
  private consumer: Consumer;
  private producer: Producer;
  private handlers: Map<string, MessageHandler> = new Map();
  private readonly maxRetries: number;
  private readonly retryBaseDelay: number;

  constructor(kafka: Kafka, groupId: string, opts: KafkaConsumerOptions = {}) {
    this.consumer = kafka.consumer({ groupId });
    this.producer = kafka.producer();
    this.maxRetries = opts.maxRetries ?? 3;
    this.retryBaseDelay = opts.retryBaseDelay ?? 500;
  }

  async connect(): Promise<void> {
    await this.consumer.connect();
    await this.producer.connect();
  }

  async disconnect(): Promise<void> {
    await this.consumer.stop();
    await this.consumer.disconnect();
    await this.producer.disconnect();
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
        let lastError: Error | undefined;
        let success = false;

        for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
          try {
            await handler({ topic, partition, message, heartbeat, pause } as EachMessagePayload);
            success = true;
            break;
          } catch (err) {
            lastError = err as Error;
            if (attempt < this.maxRetries) {
              const delay = this.retryBaseDelay * Math.pow(2, attempt - 1);
              await new Promise((r) => setTimeout(r, delay));
            }
          }
        }

        if (!success && lastError) {
          // Route to Dead Letter Queue
          await this.sendToDLQ(topic, message.value?.toString() ?? '', lastError.message);
        }

        const duration = performance.now() - start;
        recordConsume(topic, duration);

        // Commit offset regardless — message is either processed or in DLQ
        await this.consumer.commitOffsets([{
          topic,
          partition,
          offset: (BigInt(message.offset) + BigInt(1)).toString(),
        }]);
      },
    });
  }

  private async sendToDLQ(originalTopic: string, payload: string, error: string): Promise<void> {
    try {
      await this.producer.send({
        topic: `${originalTopic}.dlq`,
        messages: [{
          value: JSON.stringify({
            originalTopic,
            payload,
            error,
            timestamp: new Date().toISOString(),
          }),
        }],
      });
    } catch {
      // DLQ send failed — log but don't block offset commit
    }
  }
}
