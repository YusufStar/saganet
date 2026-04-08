import { Injectable, NestMiddleware, UnsupportedMediaTypeException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

const BODY_METHODS = new Set(['POST', 'PUT', 'PATCH']);

@Injectable()
export class ContentTypeMiddleware implements NestMiddleware {
  use(req: Request, _res: Response, next: NextFunction): void {
    if (!BODY_METHODS.has(req.method)) return next();

    // Skip if the request carries no body (e.g. POST /auth/refresh with cookie auth)
    const contentLength = parseInt(req.headers['content-length'] ?? '0', 10);
    const transferEncoding = req.headers['transfer-encoding'];
    if (contentLength === 0 && !transferEncoding) return next();

    const contentType = req.headers['content-type'] ?? '';
    if (!contentType.startsWith('application/json') && !contentType.startsWith('multipart/form-data')) {
      throw new UnsupportedMediaTypeException('Content-Type must be application/json');
    }

    next();
  }
}
