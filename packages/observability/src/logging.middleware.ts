import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { logger } from './logger';

const SENSITIVE_HEADERS = ['authorization', 'cookie', 'x-internal-secret'];
const SENSITIVE_BODY_KEYS = ['password', 'passwordHash', 'refreshToken', 'cardNumber', 'cvv'];

function maskObject(obj: Record<string, unknown>): Record<string, unknown> {
  if (!obj || typeof obj !== 'object') return obj;
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [
      k,
      SENSITIVE_BODY_KEYS.includes(k.toLowerCase()) ? '[REDACTED]' : v,
    ]),
  );
}

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    const start = Date.now();
    const { method, url } = req;

    const sanitizedHeaders = Object.fromEntries(
      Object.entries(req.headers).filter(([k]) => !SENSITIVE_HEADERS.includes(k.toLowerCase())),
    );

    res.on('finish', () => {
      const duration = Date.now() - start;
      const log = {
        method,
        url,
        statusCode: res.statusCode,
        durationMs: duration,
        requestId: req.headers['x-request-id'],
        userRole: req.headers['x-user-role'],
      };

      if (res.statusCode >= 500) {
        logger.error(log, 'request completed with server error');
      } else if (res.statusCode >= 400) {
        logger.warn(log, 'request completed with client error');
      } else {
        logger.info(log, 'request completed');
      }
    });

    next();
  }
}
