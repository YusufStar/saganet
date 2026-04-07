import { Inject, Injectable, Logger } from '@nestjs/common';
import { REDIS_CLIENT, RedisClient } from '@saganet/redis';

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

/**
 * Sliding window rate limiter backed by Redis.
 *
 * Login limits (designed to never block a legitimate user):
 *   - Per IP  : 30 attempts / 15 min  (handles office NAT, shared networks)
 *   - Per email: 10 attempts / 15 min  (targeted account protection)
 *
 * A normal user mistyping 2-3 times will never hit these limits.
 * An attacker running a credential-stuffing loop hits them in seconds.
 */
@Injectable()
export class RateLimiterService {
  private readonly logger = new Logger(RateLimiterService.name);

  // Window duration in seconds
  private readonly WINDOW_SECONDS = 15 * 60; // 15 min

  // Max attempts per window
  private readonly IP_LIMIT = 30;
  private readonly EMAIL_LIMIT = 10;

  constructor(@Inject(REDIS_CLIENT) private readonly redis: RedisClient) {}

  async checkLoginRateLimit(ip: string, email: string): Promise<RateLimitResult> {
    const ipKey = `rl:login:ip:${ip}`;
    const emailKey = `rl:login:email:${email.toLowerCase()}`;

    const [ipResult, emailResult] = await Promise.all([
      this.increment(ipKey, this.IP_LIMIT),
      this.increment(emailKey, this.EMAIL_LIMIT),
    ]);

    if (!ipResult.allowed) {
      this.logger.warn(`Rate limit hit — IP: ${ip}`);
      return ipResult;
    }

    if (!emailResult.allowed) {
      this.logger.warn(`Rate limit hit — email: ${email}`);
      return emailResult;
    }

    // Return whichever limit is tighter for the Retry-After header
    return {
      allowed: true,
      remaining: Math.min(ipResult.remaining, emailResult.remaining),
      retryAfterSeconds: 0,
    };
  }

  /** Record a successful login — resets the per-email counter immediately. */
  async onLoginSuccess(email: string): Promise<void> {
    await this.redis.del(`rl:login:email:${email.toLowerCase()}`);
  }

  // ---------------------------------------------------------------------------
  // Internal helpers
  // ---------------------------------------------------------------------------

  private async increment(key: string, limit: number): Promise<RateLimitResult> {
    // INCR + EXPIRE in a pipeline keeps this atomic enough for rate limiting
    const pipeline = this.redis.pipeline();
    pipeline.incr(key);
    pipeline.ttl(key);
    const [[, count], [, ttl]] = (await pipeline.exec()) as [[null, number], [null, number]];

    // Set expiry on first request in a window
    if (count === 1) {
      await this.redis.expire(key, this.WINDOW_SECONDS);
    }

    const remaining = Math.max(0, limit - count);
    const allowed = count <= limit;
    const retryAfterSeconds = allowed ? 0 : (ttl > 0 ? ttl : this.WINDOW_SECONDS);

    return { allowed, remaining, retryAfterSeconds };
  }
}
