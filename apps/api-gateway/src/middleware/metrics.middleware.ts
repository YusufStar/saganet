import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { httpRequestsTotal, httpRequestDuration } from '../metrics/metrics.controller';

@Injectable()
export class MetricsMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    const start = process.hrtime.bigint();

    res.on('finish', () => {
      const durationMs = Number(process.hrtime.bigint() - start) / 1e9;
      const route = req.path.split('/').slice(0, 3).join('/') || '/';
      const labels = { method: req.method, route, status_code: String(res.statusCode) };
      httpRequestsTotal.inc(labels);
      httpRequestDuration.observe(labels, durationMs);
    });

    next();
  }
}
