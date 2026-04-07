import { UnsupportedMediaTypeException } from '@nestjs/common';
import { ContentTypeMiddleware } from '../content-type.middleware';
import { Request, Response } from 'express';

describe('ContentTypeMiddleware', () => {
  let middleware: ContentTypeMiddleware;
  let mockRes: Partial<Response>;
  let next: jest.Mock;

  beforeEach(() => {
    middleware = new ContentTypeMiddleware();
    mockRes = {};
    next = jest.fn();
  });

  it('should throw UnsupportedMediaTypeException for POST without Content-Type', () => {
    const req = { method: 'POST', headers: {} } as Partial<Request>;

    expect(() => middleware.use(req as Request, mockRes as Response, next)).toThrow(
      UnsupportedMediaTypeException,
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('should pass POST with application/json Content-Type', () => {
    const req = {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
    } as Partial<Request>;

    middleware.use(req as Request, mockRes as Response, next);
    expect(next).toHaveBeenCalled();
  });

  it('should pass GET without Content-Type', () => {
    const req = { method: 'GET', headers: {} } as Partial<Request>;

    middleware.use(req as Request, mockRes as Response, next);
    expect(next).toHaveBeenCalled();
  });
});
