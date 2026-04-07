import { Controller, Get, Header, Res } from '@nestjs/common';
import { Response } from 'express';
import { register, collectDefaultMetrics, Counter, Histogram } from 'prom-client';
import { ApiExcludeEndpoint } from '@nestjs/swagger';

collectDefaultMetrics({ prefix: 'saganet_order_' });

export const httpRequestsTotal = new Counter({
  name: 'saganet_order_http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
});

export const httpRequestDuration = new Histogram({
  name: 'saganet_order_http_request_duration_seconds',
  help: 'HTTP request duration in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5],
});

export const orderCompletionDuration = new Histogram({
  name: 'saganet_order_completion_duration_seconds',
  help: 'Time from order creation to completion (saga end-to-end)',
  buckets: [1, 5, 10, 30, 60, 120, 300],
});

export const orderSuccessTotal = new Counter({
  name: 'saganet_order_success_total',
  help: 'Total successfully completed orders',
});

export const orderFailureTotal = new Counter({
  name: 'saganet_order_failure_total',
  help: 'Total failed orders',
  labelNames: ['reason'],
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
