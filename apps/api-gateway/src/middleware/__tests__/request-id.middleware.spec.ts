import { RequestIdMiddleware } from '../request-id.middleware';
import { Request, Response } from 'express';

describe('RequestIdMiddleware', () => {
  let middleware: RequestIdMiddleware;
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let next: jest.Mock;

  beforeEach(() => {
    middleware = new RequestIdMiddleware();
    mockReq = { headers: {} };
    mockRes = { setHeader: jest.fn() };
    next = jest.fn();
  });

  it('should preserve existing x-request-id header', () => {
    mockReq.headers!['x-request-id'] = 'existing-id';

    middleware.use(mockReq as Request, mockRes as Response, next);

    expect(mockReq.headers!['x-request-id']).toBe('existing-id');
    expect(mockRes.setHeader).toHaveBeenCalledWith('x-request-id', 'existing-id');
    expect(next).toHaveBeenCalled();
  });

  it('should generate a UUID if x-request-id is not present', () => {
    middleware.use(mockReq as Request, mockRes as Response, next);

    const id = mockReq.headers!['x-request-id'] as string;
    expect(id).toBeDefined();
    expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    expect(next).toHaveBeenCalled();
  });

  it('should set x-request-id on the response', () => {
    middleware.use(mockReq as Request, mockRes as Response, next);

    const id = mockReq.headers!['x-request-id'] as string;
    expect(mockRes.setHeader).toHaveBeenCalledWith('x-request-id', id);
  });
});
