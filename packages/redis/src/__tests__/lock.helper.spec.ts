import { DistributedLock } from '../lock.helper';
import type { Redis } from 'ioredis';

function makeMockRedis() {
  return {
    set: jest.fn(),
    eval: jest.fn(),
  };
}

describe('DistributedLock', () => {
  let redis: ReturnType<typeof makeMockRedis>;
  let lock: DistributedLock;

  beforeEach(() => {
    redis = makeMockRedis();
    lock = new DistributedLock(redis as unknown as Redis);
  });

  describe('acquire()', () => {
    it('returns token when lock is acquired', async () => {
      redis.set.mockResolvedValue('OK');
      const token = await lock.acquire('lock:order:1', 5000);
      expect(token).toBeTruthy();
      expect(typeof token).toBe('string');
      expect(redis.set).toHaveBeenCalledWith('lock:order:1', expect.any(String), 'PX', 5000, 'NX');
    });

    it('returns null when lock is already held', async () => {
      redis.set.mockResolvedValue(null);
      const token = await lock.acquire('lock:order:1', 5000);
      expect(token).toBeNull();
    });
  });

  describe('release()', () => {
    it('returns true when token matches and lock is released', async () => {
      redis.eval.mockResolvedValue(1);
      const result = await lock.release('lock:order:1', 'my-token');
      expect(result).toBe(true);
    });

    it('returns false when token does not match', async () => {
      redis.eval.mockResolvedValue(0);
      const result = await lock.release('lock:order:1', 'wrong-token');
      expect(result).toBe(false);
    });
  });

  describe('withLock()', () => {
    it('executes fn and releases lock on success', async () => {
      redis.set.mockResolvedValue('OK');
      redis.eval.mockResolvedValue(1);

      const fn = jest.fn().mockResolvedValue('result');
      const result = await lock.withLock('lock:x', 1000, fn);

      expect(result).toBe('result');
      expect(fn).toHaveBeenCalledTimes(1);
      expect(redis.eval).toHaveBeenCalledTimes(1);
    });

    it('throws and still releases lock when fn throws', async () => {
      redis.set.mockResolvedValue('OK');
      redis.eval.mockResolvedValue(1);

      const fn = jest.fn().mockRejectedValue(new Error('fn failed'));
      await expect(lock.withLock('lock:y', 1000, fn)).rejects.toThrow('fn failed');
      expect(redis.eval).toHaveBeenCalledTimes(1);
    });

    it('throws when lock cannot be acquired', async () => {
      redis.set.mockResolvedValue(null);
      const fn = jest.fn();
      await expect(lock.withLock('lock:z', 1000, fn)).rejects.toThrow('Could not acquire lock: lock:z');
      expect(fn).not.toHaveBeenCalled();
    });
  });
});
