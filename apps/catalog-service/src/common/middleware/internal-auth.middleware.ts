import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class InternalAuthMiddleware implements NestMiddleware {
  private readonly secret = process.env.INTERNAL_SECRET;

  use(req: Request, _res: Response, next: NextFunction): void {
    const provided = req.headers['x-internal-secret'];

    // If no secret configured, skip (dev mode)
    if (!this.secret) {
      next();
      return;
    }

    // If x-user-id or x-user-role present but secret doesn't match → strip them
    if (req.headers['x-user-id'] || req.headers['x-user-role']) {
      if (provided !== this.secret) {
        delete req.headers['x-user-id'];
        delete req.headers['x-user-role'];
      }
    }

    // Always strip the internal secret before forwarding
    delete req.headers['x-internal-secret'];
    next();
  }
}
