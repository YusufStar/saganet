import { RateLimiter } from '../rate-limit.helper';
import type { Redis } from 'ioredis';

describe('RateLimiter', () => {
  let mockExec: jest.Mock;
  let mockMulti: jest.Mock;
  let redis: { multi: jest.Mock };
  let limiter: RateLimiter;

  beforeEach(() => {
    mockExec = jest.fn();
    const chain = {
      zremrangebyscore: jest.fn().mockReturnThis(),
      zadd: jest.fn().mockReturnThis(),
      zcard: jest.fn().mockReturnThis(),
      pexpire: jest.fn().mockReturnThis(),
      exec: mockExec,
    };
    mockMulti = jest.fn().mockReturnValue(chain);
    redis = { multi: mockMulti };
    limiter = new RateLimiter(redis as unknown as Redis);
  });

  it('returns allowed=true when count is under limit', async () => {
    mockExec.mockResolvedValue([
      [null, 0],
      [null, 1],
      [null, 3],
      [null, 1],
    ]);

    const result = await limiter.check('rl:ip:1', 10, 60);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(7);
  });

  it('returns allowed=false when count exceeds limit', async () => {
    mockExec.mockResolvedValue([
      [null, 0],
      [null, 1],
      [null, 11],
      [null, 1],
    ]);

    const result = await limiter.check('rl:ip:2', 10, 60);
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it('returns resetAt in the future', async () => {
    mockExec.mockResolvedValue([[null, 0], [null, 1], [null, 1], [null, 1]]);
    const before = Date.now();
    const result = await limiter.check('rl:ip:3', 100, 60);
    expect(result.resetAt).toBeGreaterThan(before);
  });
});
