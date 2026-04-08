import { KafkaProducer } from '../producer';

const mockSend = jest.fn().mockResolvedValue(undefined);
const mockSendBatch = jest.fn().mockResolvedValue(undefined);
const mockConnect = jest.fn().mockResolvedValue(undefined);
const mockDisconnect = jest.fn().mockResolvedValue(undefined);

const mockProducer = {
  connect: mockConnect,
  disconnect: mockDisconnect,
  send: mockSend,
  sendBatch: mockSendBatch,
};

jest.mock('kafkajs', () => ({
  Kafka: jest.fn().mockImplementation(() => ({
    producer: jest.fn().mockReturnValue(mockProducer),
  })),
}));

jest.mock('../kafka.metrics', () => ({
  recordPublish: jest.fn(),
  recordDLQ: jest.fn(),
  recordConsume: jest.fn(),
  initKafkaMetrics: jest.fn(),
}));

import { Kafka } from 'kafkajs';

describe('KafkaProducer', () => {
  let producer: KafkaProducer;
  const kafka = new Kafka({ clientId: 'test', brokers: ['localhost:9092'] });

  beforeEach(() => {
    producer = new KafkaProducer(kafka);
    jest.clearAllMocks();
  });

  describe('connect / disconnect', () => {
    it('connects the underlying producer', async () => {
      await producer.connect();
      expect(mockConnect).toHaveBeenCalledTimes(1);
    });

    it('disconnects the underlying producer', async () => {
      await producer.disconnect();
      expect(mockDisconnect).toHaveBeenCalledTimes(1);
    });
  });

  describe('send()', () => {
    it('sends a message to the correct topic', async () => {
      const event = { eventId: 'e1', type: 'test', timestamp: new Date().toISOString(), payload: { foo: 'bar' } };
      await producer.send('test-topic', event);

      expect(mockSend).toHaveBeenCalledWith({
        topic: 'test-topic',
        messages: [{ key: 'e1', value: JSON.stringify(event) }],
      });
    });

    it('records publish metric', async () => {
      const { recordPublish } = require('../kafka.metrics') as { recordPublish: jest.Mock };
      const event = { eventId: 'e2', type: 'test', timestamp: new Date().toISOString(), payload: {} };
      await producer.send('my-topic', event);
      expect(recordPublish).toHaveBeenCalledWith('my-topic', expect.any(Number));
    });
  });

  describe('sendWithRetry()', () => {
    it('succeeds on first attempt', async () => {
      const event = { eventId: 'e3', type: 'test', timestamp: new Date().toISOString(), payload: {} };
      await producer.sendWithRetry('topic', event, 3, 0);
      expect(mockSend).toHaveBeenCalledTimes(1);
    });

    it('retries on failure and succeeds', async () => {
      mockSend
        .mockRejectedValueOnce(new Error('transient'))
        .mockResolvedValueOnce(undefined);

      const event = { eventId: 'e4', type: 'test', timestamp: new Date().toISOString(), payload: {} };
      await producer.sendWithRetry('topic', event, 3, 0);
      expect(mockSend).toHaveBeenCalledTimes(2);
    });

    it('throws after max attempts exhausted', async () => {
      mockSend
        .mockRejectedValueOnce(new Error('permanent failure'))
        .mockRejectedValueOnce(new Error('permanent failure'))
        .mockRejectedValueOnce(new Error('permanent failure'));
      const event = { eventId: 'e5', type: 'test', timestamp: new Date().toISOString(), payload: {} };
      await expect(producer.sendWithRetry('topic', event, 3, 0)).rejects.toThrow('permanent failure');
      expect(mockSend).toHaveBeenCalledTimes(3);
    });
  });

  describe('sendToDLQ()', () => {
    it('sends to {topic}.dlq with correct envelope', async () => {
      await producer.sendToDLQ('order.created', { orderId: '123' }, 'processing failed');

      expect(mockSend).toHaveBeenCalledWith({
        topic: 'order.created.dlq',
        messages: [
          {
            value: expect.stringContaining('"originalTopic":"order.created"'),
          },
        ],
      });
    });

    it('records DLQ metric', async () => {
      const { recordDLQ } = require('../kafka.metrics') as { recordDLQ: jest.Mock };
      await producer.sendToDLQ('payment.charge', {}, 'err');
      expect(recordDLQ).toHaveBeenCalledWith('payment.charge');
    });
  });

  describe('sendBatch()', () => {
    it('groups messages by topic', async () => {
      await producer.sendBatch([
        { topic: 'topic-a', value: { x: 1 } },
        { topic: 'topic-b', value: { y: 2 } },
        { topic: 'topic-a', value: { x: 3 } },
      ]);

      expect(mockSendBatch).toHaveBeenCalledWith({
        topicMessages: expect.arrayContaining([
          expect.objectContaining({ topic: 'topic-a', messages: expect.arrayContaining([expect.any(Object), expect.any(Object)]) }),
          expect.objectContaining({ topic: 'topic-b', messages: expect.arrayContaining([expect.any(Object)]) }),
        ]),
      });
    });
  });
});
