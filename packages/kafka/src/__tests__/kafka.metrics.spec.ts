import { Registry } from 'prom-client';

describe('kafka.metrics', () => {
  let initKafkaMetrics: (reg: Registry) => void;
  let recordPublish: (topic: string, durationMs: number) => void;
  let recordConsume: (topic: string, durationMs: number) => void;
  let recordDLQ: (topic: string) => void;

  beforeEach(() => {
    jest.resetModules();
    const metrics = require('../kafka.metrics') as typeof import('../kafka.metrics');
    initKafkaMetrics = metrics.initKafkaMetrics;
    recordPublish = metrics.recordPublish;
    recordConsume = metrics.recordConsume;
    recordDLQ = metrics.recordDLQ;
  });

  it('does not throw when recording before init', () => {
    expect(() => recordPublish('topic', 100)).not.toThrow();
    expect(() => recordConsume('topic', 50)).not.toThrow();
    expect(() => recordDLQ('topic')).not.toThrow();
  });

  it('initializes metrics with a registry', () => {
    const registry = new Registry();
    expect(() => initKafkaMetrics(registry)).not.toThrow();
  });

  it('records publish metric after init', async () => {
    const registry = new Registry();
    initKafkaMetrics(registry);
    recordPublish('test-topic', 123);

    const metrics = await registry.getMetricsAsJSON();
    const publishTotal = metrics.find((m) => m.name === 'kafka_messages_published_total');
    expect(publishTotal).toBeDefined();
  });

  it('records DLQ metric after init', async () => {
    const registry = new Registry();
    initKafkaMetrics(registry);
    recordDLQ('order.created');

    const metrics = await registry.getMetricsAsJSON();
    const dlqTotal = metrics.find((m) => m.name === 'kafka_dlq_messages_total');
    expect(dlqTotal).toBeDefined();
  });
});
