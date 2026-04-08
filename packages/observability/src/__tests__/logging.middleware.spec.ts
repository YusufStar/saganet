import { LoggingMiddleware } from '../logging.middleware';
import type { Request, Response, NextFunction } from 'express';

jest.mock('../logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

function makeMockRes(statusCode = 200) {
  const listeners: Record<string, Array<() => void>> = {};
  return {
    statusCode,
    on: jest.fn((event: string, cb: () => void) => {
      listeners[event] = listeners[event] ?? [];
      listeners[event].push(cb);
    }),
    emit: (event: string) => listeners[event]?.forEach((cb) => cb()),
    _listeners: listeners,
  };
}

function makeMockReq(overrides: Partial<Request> = {}): Request {
  return {
    method: 'GET',
    url: '/api/health',
    headers: {},
    ...overrides,
  } as unknown as Request;
}

describe('LoggingMiddleware', () => {
  let middleware: LoggingMiddleware;
  let next: NextFunction;

  beforeEach(() => {
    middleware = new LoggingMiddleware();
    next = jest.fn();
  });

  it('calls next()', () => {
    const req = makeMockReq();
    const res = makeMockRes();
    middleware.use(req, res as unknown as Response, next);
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('attaches a finish listener to the response', () => {
    const req = makeMockReq();
    const res = makeMockRes();
    middleware.use(req, res as unknown as Response, next);
    expect(res.on).toHaveBeenCalledWith('finish', expect.any(Function));
  });

  it('does not throw with authorization header present', () => {
    const req = makeMockReq({
      headers: {
        authorization: 'Bearer secret-token',
        'x-request-id': 'req-123',
      },
    });
    const res = makeMockRes(200);
    expect(() => middleware.use(req, res as unknown as Response, next)).not.toThrow();
  });

  it('registers finish listener that fires on response end', () => {
    const req = makeMockReq();
    const res = makeMockRes(200);
    middleware.use(req, res as unknown as Response, next);
    expect(() => res.emit('finish')).not.toThrow();
  });

  it('handles 4xx status without throwing', () => {
    const req = makeMockReq({ url: '/api/missing' });
    const res = makeMockRes(404);
    middleware.use(req, res as unknown as Response, next);
    expect(() => res.emit('finish')).not.toThrow();
  });

  it('handles 5xx status without throwing', () => {
    const req = makeMockReq({ url: '/api/error' });
    const res = makeMockRes(500);
    middleware.use(req, res as unknown as Response, next);
    expect(() => res.emit('finish')).not.toThrow();
  });

  it('logs info for successful requests', () => {
    const { logger } = require('../logger') as { logger: { info: jest.Mock; warn: jest.Mock; error: jest.Mock } };
    const req = makeMockReq();
    const res = makeMockRes(200);
    middleware.use(req, res as unknown as Response, next);
    res.emit('finish');
    expect(logger.info).toHaveBeenCalled();
  });

  it('logs warn for 4xx requests', () => {
    const { logger } = require('../logger') as { logger: { info: jest.Mock; warn: jest.Mock; error: jest.Mock } };
    const req = makeMockReq();
    const res = makeMockRes(404);
    middleware.use(req, res as unknown as Response, next);
    res.emit('finish');
    expect(logger.warn).toHaveBeenCalled();
  });

  it('logs error for 5xx requests', () => {
    const { logger } = require('../logger') as { logger: { info: jest.Mock; warn: jest.Mock; error: jest.Mock } };
    const req = makeMockReq();
    const res = makeMockRes(500);
    middleware.use(req, res as unknown as Response, next);
    res.emit('finish');
    expect(logger.error).toHaveBeenCalled();
  });
});
