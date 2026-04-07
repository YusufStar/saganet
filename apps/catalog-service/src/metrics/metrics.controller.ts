import { Controller, Get, Header, Inject, Res } from '@nestjs/common';
import { Response } from 'express';
import { register, collectDefaultMetrics, Counter, Gauge, Histogram } from 'prom-client';
import { ApiExcludeEndpoint } from '@nestjs/swagger';
import { DataSource } from 'typeorm';
import { DATA_SOURCE } from '@saganet/db';
import { ProductEntity } from '../product/product.entity';
import { ProductStatus } from '../product/product-status.enum';

collectDefaultMetrics({ prefix: 'saganet_catalog_' });

export const httpRequestsTotal = new Counter({
  name: 'saganet_catalog_http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
});

export const httpRequestDuration = new Histogram({
  name: 'saganet_catalog_http_request_duration_seconds',
  help: 'HTTP request duration in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5],
});

export const productViewsTotal = new Counter({
  name: 'saganet_catalog_product_views_total',
  help: 'Total product detail page views',
  labelNames: ['product_id'],
});

export const pendingReviewGauge = new Gauge({
  name: 'saganet_catalog_pending_review_products',
  help: 'Number of products in PENDING_REVIEW status',
});

export const vendorProductsGauge = new Gauge({
  name: 'saganet_catalog_vendor_products_total',
  help: 'Total products per vendor',
  labelNames: ['vendor_id'],
});

@Controller('metrics')
export class MetricsController {
  constructor(@Inject(DATA_SOURCE) private readonly dataSource: DataSource) {}

  @Get()
  @Header('Content-Type', 'text/plain; version=0.0.4; charset=utf-8')
  @ApiExcludeEndpoint()
  async metrics(@Res() res: Response): Promise<void> {
    const repo = this.dataSource.getRepository(ProductEntity);

    const pendingCount = await repo.count({ where: { status: ProductStatus.PENDING_REVIEW } });
    pendingReviewGauge.set(pendingCount);

    const vendorCounts: { vendorId: string; count: string }[] = await repo
      .createQueryBuilder('product')
      .select('product.vendorId', 'vendorId')
      .addSelect('COUNT(*)', 'count')
      .where('product.deletedAt IS NULL')
      .groupBy('product.vendorId')
      .getRawMany();

    vendorProductsGauge.reset();
    for (const row of vendorCounts) {
      vendorProductsGauge.labels(row.vendorId).set(parseInt(row.count, 10));
    }

    res.end(await register.metrics());
  }
}
