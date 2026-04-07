import { Kafka } from 'kafkajs';

export interface KafkaConfig {
  brokers?: string[];
  clientId?: string;
  connectionTimeout?: number;
  requestTimeout?: number;
}

export function createKafka(config: KafkaConfig = {}): Kafka {
  const brokers =
    config.brokers ??
    (process.env.KAFKA_BROKERS ?? 'localhost:9092').split(',').map((b) => b.trim());

  return new Kafka({
    clientId: config.clientId ?? process.env.KAFKA_CLIENT_ID ?? 'saganet',
    brokers,
    connectionTimeout: config.connectionTimeout ?? 3_000,
    requestTimeout: config.requestTimeout ?? 30_000,
  });
}
