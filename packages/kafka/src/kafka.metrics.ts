import { Counter, Histogram, Registry } from 'prom-client';

let registry: Registry | undefined;
let publishLatency: Histogram | undefined;
let consumeLatency: Histogram | undefined;
let publishTotal: Counter | undefined;
let consumeTotal: Counter | undefined;
let dlqTotal: Counter | undefined;

export function initKafkaMetrics(reg: Registry): void {
  registry = reg;

  publishLatency = new Histogram({
    name: 'kafka_publish_duration_seconds',
    help: 'Time to publish a Kafka message',
    labelNames: ['topic'],
    registers: [reg],
  });

  consumeLatency = new Histogram({
    name: 'kafka_consume_duration_seconds',
    help: 'Time to process a consumed Kafka message',
    labelNames: ['topic'],
    registers: [reg],
  });

  publishTotal = new Counter({
    name: 'kafka_messages_published_total',
    help: 'Total Kafka messages published',
    labelNames: ['topic'],
    registers: [reg],
  });

  consumeTotal = new Counter({
    name: 'kafka_messages_consumed_total',
    help: 'Total Kafka messages consumed',
    labelNames: ['topic'],
    registers: [reg],
  });

  dlqTotal = new Counter({
    name: 'kafka_dlq_messages_total',
    help: 'Total messages sent to DLQ',
    labelNames: ['topic'],
    registers: [reg],
  });
}

export function recordPublish(topic: string, durationMs: number): void {
  publishLatency?.observe({ topic }, durationMs / 1000);
  publishTotal?.inc({ topic });
}

export function recordConsume(topic: string, durationMs: number): void {
  consumeLatency?.observe({ topic }, durationMs / 1000);
  consumeTotal?.inc({ topic });
}

export function recordDLQ(topic: string): void {
  dlqTotal?.inc({ topic });
}
