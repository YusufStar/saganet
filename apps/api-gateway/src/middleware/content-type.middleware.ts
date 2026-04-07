import { Injectable, NestMiddleware, UnsupportedMediaTypeException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

const BODY_METHODS = new Set(['POST', 'PUT', 'PATCH']);

@Injectable()
export class ContentTypeMiddleware implements NestMiddleware {
  use(req: Request, _res: Response, next: NextFunction): void {
    if (!BODY_METHODS.has(req.method)) return next();

    const contentType = req.headers['content-type'] ?? '';
    if (!contentType.startsWith('application/json')) {
      throw new UnsupportedMediaTypeException('Content-Type must be application/json');
    }

    next();
  }
}
