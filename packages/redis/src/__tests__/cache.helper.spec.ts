import { CacheHelper } from '../cache.helper';
import type { Redis } from 'ioredis';

function makeMockRedis(): jest.Mocked<Pick<Redis, 'get' | 'set' | 'setex' | 'del' | 'mget' | 'keys'>> {
  return {
    get: jest.fn(),
    set: jest.fn(),
    setex: jest.fn(),
    del: jest.fn(),
    mget: jest.fn(),
    keys: jest.fn(),
  };
}

describe('CacheHelper', () => {
  let redis: ReturnType<typeof makeMockRedis>;
  let cache: CacheHelper;

  beforeEach(() => {
    redis = makeMockRedis();
    cache = new CacheHelper(redis as unknown as Redis);
  });

  describe('get()', () => {
    it('returns null when key does not exist', async () => {
      redis.get.mockResolvedValue(null);
      const result = await cache.get('missing-key');
      expect(result).toBeNull();
    });

    it('parses and returns JSON value', async () => {
      redis.get.mockResolvedValue(JSON.stringify({ id: 1 }));
      const result = await cache.get<{ id: number }>('key');
      expect(result).toEqual({ id: 1 });
    });
  });

  describe('set()', () => {
    it('calls setex when TTL provided', async () => {
      redis.setex.mockResolvedValue('OK');
      await cache.set('key', { x: 1 }, 300);
      expect(redis.setex).toHaveBeenCalledWith('key', 300, JSON.stringify({ x: 1 }));
    });

    it('calls set without TTL when not provided', async () => {
      redis.set.mockResolvedValue('OK');
      await cache.set('key', { x: 1 });
      expect(redis.set).toHaveBeenCalledWith('key', JSON.stringify({ x: 1 }));
    });
  });

  describe('del()', () => {
    it('calls redis.del with the key', async () => {
      redis.del.mockResolvedValue(1);
      await cache.del('my-key');
      expect(redis.del).toHaveBeenCalledWith('my-key');
    });
  });

  describe('mget()', () => {
    it('returns empty array for empty keys', async () => {
      const result = await cache.mget([]);
      expect(result).toEqual([]);
      expect(redis.mget).not.toHaveBeenCalled();
    });

    it('returns parsed values with nulls for missing keys', async () => {
      redis.mget.mockResolvedValue([JSON.stringify({ a: 1 }), null]);
      const result = await cache.mget<{ a: number }>(['key1', 'key2']);
      expect(result).toEqual([{ a: 1 }, null]);
    });
  });

  describe('invalidatePattern()', () => {
    it('deletes all keys matching pattern', async () => {
      redis.keys.mockResolvedValue(['cache:1', 'cache:2']);
      redis.del.mockResolvedValue(2);
      await cache.invalidatePattern('cache:*');
      expect(redis.del).toHaveBeenCalledWith('cache:1', 'cache:2');
    });

    it('does nothing if no keys match', async () => {
      redis.keys.mockResolvedValue([]);
      await cache.invalidatePattern('no-match:*');
      expect(redis.del).not.toHaveBeenCalled();
    });
  });
});
