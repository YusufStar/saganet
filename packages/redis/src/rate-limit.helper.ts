import { Redis } from 'ioredis';

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number; // Unix timestamp ms
}

/**
 * Sliding window rate limiter backed by Redis.
 */
export class RateLimiter {
  constructor(private readonly redis: Redis) {}

  async check(
    key: string,
    limit: number,
    windowSeconds: number,
  ): Promise<RateLimitResult> {
    const now = Date.now();
    const windowMs = windowSeconds * 1000;
    const windowStart = now - windowMs;

    // Use a sorted set: score = timestamp, member = unique request ID
    const multi = this.redis.multi();
    multi.zremrangebyscore(key, '-inf', windowStart.toString());
    multi.zadd(key, now.toString(), `${now}-${Math.random()}`);
    multi.zcard(key);
    multi.pexpire(key, windowMs);

    const results = await multi.exec();
    const count = results?.[2]?.[1] as number ?? 0;

    return {
      allowed: count <= limit,
      remaining: Math.max(0, limit - count),
      resetAt: now + windowMs,
    };
  }

  async reset(key: string): Promise<void> {
    await this.redis.del(key);
  }
}
