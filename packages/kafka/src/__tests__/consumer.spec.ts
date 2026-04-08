import { KafkaConsumer } from '../consumer';
import type { EachMessagePayload } from 'kafkajs';

jest.mock('../kafka.metrics', () => ({
  recordConsume: jest.fn(),
  recordPublish: jest.fn(),
  recordDLQ: jest.fn(),
  initKafkaMetrics: jest.fn(),
}));

const mockCommitOffsets = jest.fn().mockResolvedValue(undefined);
const mockRun = jest.fn().mockResolvedValue(undefined);
const mockSubscribe = jest.fn().mockResolvedValue(undefined);
const mockConnect = jest.fn().mockResolvedValue(undefined);
const mockDisconnect = jest.fn().mockResolvedValue(undefined);
const mockStop = jest.fn().mockResolvedValue(undefined);

const mockConsumer = {
  connect: mockConnect,
  disconnect: mockDisconnect,
  stop: mockStop,
  subscribe: mockSubscribe,
  run: mockRun,
  commitOffsets: mockCommitOffsets,
};

jest.mock('kafkajs', () => ({
  Kafka: jest.fn().mockImplementation(() => ({
    consumer: jest.fn().mockReturnValue(mockConsumer),
  })),
}));

import { Kafka } from 'kafkajs';

describe('KafkaConsumer', () => {
  let consumer: KafkaConsumer;
  const kafka = new Kafka({ clientId: 'test', brokers: ['localhost:9092'] });

  beforeEach(() => {
    consumer = new KafkaConsumer(kafka, 'test-group');
    jest.clearAllMocks();
  });

  it('connects the underlying consumer', async () => {
    await consumer.connect();
    expect(mockConnect).toHaveBeenCalledTimes(1);
  });

  it('disconnects by calling stop() then disconnect()', async () => {
    await consumer.disconnect();
    expect(mockStop).toHaveBeenCalledTimes(1);
    expect(mockDisconnect).toHaveBeenCalledTimes(1);
  });

  it('registers a handler for a topic via subscribe()', () => {
    const handler = jest.fn();
    consumer.subscribe('my-topic', handler);
    expect(handler).not.toHaveBeenCalled();
  });

  it('calls consumer.subscribe and consumer.run when run() is called', async () => {
    consumer.subscribe('topic-x', jest.fn());
    await consumer.run();

    expect(mockSubscribe).toHaveBeenCalledWith({
      topics: ['topic-x'],
      fromBeginning: false,
    });
    expect(mockRun).toHaveBeenCalledWith(
      expect.objectContaining({ autoCommit: false }),
    );
  });

  it('invokes handler and commits offset in eachMessage', async () => {
    const handler = jest.fn().mockResolvedValue(undefined);
    consumer.subscribe('order.created', handler);

    let eachMessageFn: ((payload: EachMessagePayload) => Promise<void>) | undefined;
    mockRun.mockImplementationOnce(async (opts: { eachMessage: (p: EachMessagePayload) => Promise<void> }) => {
      eachMessageFn = opts.eachMessage;
    });

    await consumer.run();

    const fakePayload = {
      topic: 'order.created',
      partition: 0,
      message: {
        offset: '5',
        key: null,
        value: Buffer.from('{"test":true}'),
        timestamp: '0',
        attributes: 0,
        headers: {},
      },
      heartbeat: jest.fn(),
      pause: jest.fn(),
    } as unknown as EachMessagePayload;

    await eachMessageFn!(fakePayload);

    expect(handler).toHaveBeenCalledWith(fakePayload);
    expect(mockCommitOffsets).toHaveBeenCalledWith([
      { topic: 'order.created', partition: 0, offset: '6' },
    ]);
  });
});
