import { RateLimitMiddleware } from '../rate-limit.middleware';
import { Request, Response } from 'express';

describe('RateLimitMiddleware', () => {
  let middleware: RateLimitMiddleware;
  let mockRedis: any;
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let next: jest.Mock;

  beforeEach(() => {
    mockRedis = {
      pipeline: jest.fn(),
      expire: jest.fn().mockResolvedValue('OK'),
    };
    middleware = new RateLimitMiddleware(mockRedis);
    mockReq = {
      headers: {},
      ip: '127.0.0.1',
      path: '/api/catalog/products',
    };
    mockRes = {
      setHeader: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  it('should allow request below limit', async () => {
    const pipeline = {
      incr: jest.fn(),
      ttl: jest.fn(),
      exec: jest.fn().mockResolvedValue([
        [null, 1],
        [null, -1],
      ]),
    };
    mockRedis.pipeline.mockReturnValue(pipeline);

    await middleware.use(mockReq as Request, mockRes as Response, next);

    expect(next).toHaveBeenCalled();
    expect(mockRes.setHeader).toHaveBeenCalledWith('x-ratelimit-limit', 120);
    expect(mockRes.setHeader).toHaveBeenCalledWith('x-ratelimit-remaining', 119);
  });

  it('should return 429 when above limit', async () => {
    const pipeline = {
      incr: jest.fn(),
      ttl: jest.fn(),
      exec: jest.fn().mockResolvedValue([
        [null, 121],
        [null, 45],
      ]),
    };
    mockRedis.pipeline.mockReturnValue(pipeline);

    await middleware.use(mockReq as Request, mockRes as Response, next);

    expect(next).not.toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(429);
    expect(mockRes.json).toHaveBeenCalledWith({
      statusCode: 429,
      message: 'Too many requests. Please slow down.',
    });
    expect(mockRes.setHeader).toHaveBeenCalledWith('retry-after', 45);
  });
});
