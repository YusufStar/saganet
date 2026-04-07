import { RateLimiterService } from '../rate-limiter.service';

describe('RateLimiterService', () => {
  let rateLimiter: RateLimiterService;
  let mockRedis: any;

  beforeEach(() => {
    mockRedis = {
      pipeline: jest.fn(),
      expire: jest.fn(),
      del: jest.fn(),
    };

    rateLimiter = new RateLimiterService(mockRedis);
  });

  it('should allow requests under the limit', async () => {
    const mockPipeline = {
      incr: jest.fn(),
      ttl: jest.fn(),
      exec: jest.fn().mockResolvedValue([[null, 1], [null, -1]]),
    };
    mockRedis.pipeline.mockReturnValue(mockPipeline);

    const result = await rateLimiter.checkLoginRateLimit('127.0.0.1', 'test@example.com');

    expect(result.allowed).toBe(true);
  });

  it('should block when IP limit is exceeded', async () => {
    const mockPipeline = {
      incr: jest.fn(),
      ttl: jest.fn(),
      exec: jest.fn(),
    };
    mockRedis.pipeline.mockReturnValue(mockPipeline);

    // First call: IP over limit, email under limit
    mockPipeline.exec
      .mockResolvedValueOnce([[null, 31], [null, 800]]) // IP: 31 > 30
      .mockResolvedValueOnce([[null, 1], [null, -1]]);  // email: 1 < 10

    const result = await rateLimiter.checkLoginRateLimit('127.0.0.1', 'test@example.com');

    expect(result.allowed).toBe(false);
    expect(result.retryAfterSeconds).toBeGreaterThan(0);
  });

  it('should block when email limit is exceeded', async () => {
    const mockPipeline = {
      incr: jest.fn(),
      ttl: jest.fn(),
      exec: jest.fn(),
    };
    mockRedis.pipeline.mockReturnValue(mockPipeline);

    // IP under limit, email over limit
    mockPipeline.exec
      .mockResolvedValueOnce([[null, 5], [null, 800]])  // IP: 5 < 30
      .mockResolvedValueOnce([[null, 11], [null, 600]]); // email: 11 > 10

    const result = await rateLimiter.checkLoginRateLimit('127.0.0.1', 'test@example.com');

    expect(result.allowed).toBe(false);
    expect(result.retryAfterSeconds).toBeGreaterThan(0);
  });

  it('should delete email key on login success', async () => {
    await rateLimiter.onLoginSuccess('test@example.com');

    expect(mockRedis.del).toHaveBeenCalledWith('rl:login:email:test@example.com');
  });
});
