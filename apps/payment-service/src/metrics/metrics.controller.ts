import { Controller, Get, Header, Res } from '@nestjs/common';
import { Response } from 'express';
import { register, collectDefaultMetrics, Counter, Histogram } from 'prom-client';
import { ApiExcludeEndpoint } from '@nestjs/swagger';

collectDefaultMetrics({ prefix: 'saganet_payment_' });

export const paymentSuccessTotal = new Counter({
  name: 'saganet_payment_success_total',
  help: 'Successful payments',
});

export const paymentFailureTotal = new Counter({
  name: 'saganet_payment_failure_total',
  help: 'Failed payments',
  labelNames: ['reason'],
});

export const paymentDuration = new Histogram({
  name: 'saganet_payment_duration_seconds',
  help: 'Payment processing duration',
  buckets: [0.1, 0.5, 1, 2, 5],
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
