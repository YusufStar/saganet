import { Controller, Get, Header, Res } from '@nestjs/common';
import { Response } from 'express';
import { register, collectDefaultMetrics, Counter, Histogram } from 'prom-client';
import { ApiExcludeEndpoint } from '@nestjs/swagger';

// Initialize default Node.js metrics (memory, CPU, event loop lag, etc.)
collectDefaultMetrics({ prefix: 'saganet_gateway_' });

export const httpRequestsTotal = new Counter({
  name: 'saganet_gateway_http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
});

export const httpRequestDuration = new Histogram({
  name: 'saganet_gateway_http_request_duration_seconds',
  help: 'HTTP request duration in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5],
});

@Controller('metrics')
export class MetricsController {
  @Get()
  @Header('Content-Type', 'text/plain; version=0.0.4; charset=utf-8')
  @ApiExcludeEndpoint()
  async metrics(@Res() res: Response): Promise<void> {
    res.end(await register.metrics());
  }
}
