import { Injectable, InternalServerErrorException, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class InternalAuthMiddleware implements NestMiddleware {
  private readonly secret = process.env.INTERNAL_SECRET;

  use(req: Request, _res: Response, next: NextFunction): void {
    if (!this.secret) {
      if (process.env.NODE_ENV === 'production') {
        throw new InternalServerErrorException('INTERNAL_SECRET is not configured');
      }
      // Dev mode: skip check
      next();
      return;
    }

    const provided = req.headers['x-internal-secret'];

    // Strip spoofed identity headers if secret doesn't match
    if (req.headers['x-user-id'] || req.headers['x-user-role']) {
      if (provided !== this.secret) {
        delete req.headers['x-user-id'];
        delete req.headers['x-user-role'];
      }
    }

    delete req.headers['x-internal-secret'];
    next();
  }
}
