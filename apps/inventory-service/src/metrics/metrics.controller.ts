import { Controller, Get, Header, Res } from '@nestjs/common';
import { Response } from 'express';
import { register, collectDefaultMetrics, Counter, Gauge } from 'prom-client';
import { ApiExcludeEndpoint } from '@nestjs/swagger';

collectDefaultMetrics({ prefix: 'saganet_inventory_' });

export const lowStockGauge = new Gauge({
  name: 'saganet_inventory_low_stock_products',
  help: 'Products with available quantity <= 5',
  labelNames: ['product_id'],
});

export const reservationSuccessTotal = new Counter({
  name: 'saganet_inventory_reservation_success_total',
  help: 'Total successful stock reservations',
});

export const reservationFailureTotal = new Counter({
  name: 'saganet_inventory_reservation_failure_total',
  help: 'Total failed stock reservations (insufficient stock)',
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
