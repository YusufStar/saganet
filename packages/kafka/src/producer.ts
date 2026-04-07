import { Kafka, Producer } from 'kafkajs';
import { KafkaEvent } from './types';

export class KafkaProducer {
  private producer: Producer;

  constructor(private kafka: Kafka) {
    this.producer = kafka.producer();
  }

  async connect(): Promise<void> {
    await this.producer.connect();
  }

  async disconnect(): Promise<void> {
    await this.producer.disconnect();
  }

  async send<T>(topic: string, event: KafkaEvent<T>): Promise<void> {
    await this.producer.send({
      topic,
      messages: [
        {
          key: event.eventId,
          value: JSON.stringify(event),
        },
      ],
    });
  }

  /** Send with retry and exponential backoff */
  async sendWithRetry<T>(
    topic: string,
    event: KafkaEvent<T>,
    maxAttempts = 3,
    baseDelayMs = 100,
  ): Promise<void> {
    let lastError: Error | undefined;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        await this.send(topic, event);
        return;
      } catch (err) {
        lastError = err as Error;
        if (attempt < maxAttempts) {
          await new Promise((r) => setTimeout(r, baseDelayMs * Math.pow(2, attempt - 1)));
        }
      }
    }
    throw lastError;
  }

  /** Send a message to the dead letter queue for a topic */
  async sendToDLQ(originalTopic: string, payload: object, error: string): Promise<void> {
    const dlqTopic = `${originalTopic}.dlq`;
    await this.producer.send({
      topic: dlqTopic,
      messages: [{
        value: JSON.stringify({
          originalTopic,
          payload,
          error,
          timestamp: new Date().toISOString(),
        }),
      }],
    });
  }

  /** Batch send messages to multiple topics */
  async sendBatch(messages: Array<{ topic: string; value: object; key?: string }>): Promise<void> {
    const topicMessages = messages.reduce(
      (acc, msg) => {
        const existing = acc.find((m) => m.topic === msg.topic);
        const record = { value: JSON.stringify(msg.value), key: msg.key };
        if (existing) {
          existing.messages.push(record);
        } else {
          acc.push({ topic: msg.topic, messages: [record] });
        }
        return acc;
      },
      [] as Array<{ topic: string; messages: Array<{ value: string; key?: string }> }>,
    );
    await this.producer.sendBatch({ topicMessages });
  }
}
