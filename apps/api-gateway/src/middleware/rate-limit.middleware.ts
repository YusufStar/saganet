import { Inject, Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { REDIS_CLIENT, RedisClient } from '@saganet/redis';

interface RouteLimit {
  pattern: RegExp;
  limit: number;
  windowSeconds: number;
}

// Per-IP sliding window limits.
// Designed so normal usage never triggers them.
const ROUTE_LIMITS: RouteLimit[] = [
  // Auth write endpoints — tighter (brute-force surface)
  { pattern: /^\/api\/auth\/(login|register|forgot-password|reset-password)/, limit: 10,  windowSeconds: 900 },
  // Default for everything else
  { pattern: /.*/, limit: 120, windowSeconds: 60 },
];

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  constructor(@Inject(REDIS_CLIENT) private readonly redis: RedisClient) {}

  async use(req: Request, res: Response, next: NextFunction): Promise<void> {
    const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ?? req.ip ?? 'unknown';
    const path = req.path;

    const rule = ROUTE_LIMITS.find(r => r.pattern.test(path))!;
    const key = `rl:gw:${rule.windowSeconds}:${ip}:${path.split('/').slice(0, 3).join('/')}`;

    const pipeline = this.redis.pipeline();
    pipeline.incr(key);
    pipeline.ttl(key);
    const [[, count], [, ttl]] = (await pipeline.exec()) as [[null, number], [null, number]];

    if (count === 1) await this.redis.expire(key, rule.windowSeconds);

    res.setHeader('x-ratelimit-limit', rule.limit);
    res.setHeader('x-ratelimit-remaining', Math.max(0, rule.limit - count));

    if (count > rule.limit) {
      const retryAfter = ttl > 0 ? ttl : rule.windowSeconds;
      res.setHeader('retry-after', retryAfter);
      res.status(429).json({ statusCode: 429, message: 'Too many requests. Please slow down.' });
      return;
    }

    next();
  }
}
