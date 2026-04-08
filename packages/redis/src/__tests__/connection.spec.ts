const mockOn = jest.fn();
const mockQuit = jest.fn();

jest.mock('ioredis', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      on: mockOn,
      quit: mockQuit,
    })),
  };
});

import { createRedisClient } from '../redis.client';

describe('createRedisClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates a Redis client without throwing', () => {
    const client = createRedisClient();
    expect(client).toBeDefined();
  });

  it('passes custom config to Redis constructor', () => {
    const Redis = require('ioredis').default as jest.Mock;
    createRedisClient({ host: '10.0.0.1', port: 6380, db: 2 });

    expect(Redis).toHaveBeenCalledWith(
      expect.objectContaining({
        host: '10.0.0.1',
        port: 6380,
        db: 2,
      }),
    );
  });

  it('uses default values when no config provided', () => {
    const Redis = require('ioredis').default as jest.Mock;
    createRedisClient();

    expect(Redis).toHaveBeenCalledWith(
      expect.objectContaining({
        host: 'localhost',
        connectTimeout: 5_000,
        maxRetriesPerRequest: 3,
        enableReadyCheck: true,
        lazyConnect: false,
      }),
    );
  });
});
