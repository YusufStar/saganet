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
}
