import { Redis } from 'ioredis';
import { randomUUID } from 'crypto';

export class DistributedLock {
  constructor(private readonly redis: Redis) {}

  /**
   * Acquire a distributed lock. Returns the lock token if acquired, null if not.
   * @param key Lock key (e.g. 'lock:order:123')
   * @param ttlMs Lock TTL in milliseconds
   */
  async acquire(key: string, ttlMs: number): Promise<string | null> {
    const token = randomUUID();
    const result = await this.redis.set(key, token, 'PX', ttlMs, 'NX');
    return result === 'OK' ? token : null;
  }

  /**
   * Release a lock. Only releases if the token matches (prevents releasing someone else's lock).
   */
  async release(key: string, token: string): Promise<boolean> {
    const script = `
      if redis.call('get', KEYS[1]) == ARGV[1] then
        return redis.call('del', KEYS[1])
      else
        return 0
      end
    `;
    const result = await this.redis.eval(script, 1, key, token);
    return result === 1;
  }

  /**
   * Execute a function with a distributed lock.
   * Throws if the lock cannot be acquired.
   */
  async withLock<T>(key: string, ttlMs: number, fn: () => Promise<T>): Promise<T> {
    const token = await this.acquire(key, ttlMs);
    if (!token) {
      throw new Error(`Could not acquire lock: ${key}`);
    }
    try {
      return await fn();
    } finally {
      await this.release(key, token);
    }
  }
}
