import { Controller, Get, Param, Res, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { ApiExcludeController } from '@nestjs/swagger';

const SERVICE_DOCS_URLS: Record<string, string> = {
  auth:         process.env.AUTH_SERVICE_URL         ?? 'http://localhost:3001',
  catalog:      process.env.CATALOG_SERVICE_URL      ?? 'http://localhost:3002',
  inventory:    process.env.INVENTORY_SERVICE_URL    ?? 'http://localhost:3003',
  order:        process.env.ORDER_SERVICE_URL        ?? 'http://localhost:3004',
  payment:      process.env.PAYMENT_SERVICE_URL      ?? 'http://localhost:3005',
  notification: process.env.NOTIFICATION_SERVICE_URL ?? 'http://localhost:3006',
};

@ApiExcludeController()
@Controller('swagger-proxy')
export class SwaggerProxyController {
  @Get(':service')
  async proxyDocs(@Param('service') service: string, @Res() res: Response): Promise<void> {
    const base = SERVICE_DOCS_URLS[service];
    if (!base) {
      throw new HttpException(`Unknown service: ${service}`, HttpStatus.NOT_FOUND);
    }

    try {
      const response = await fetch(`${base}/docs-json`);
      if (!response.ok) {
        throw new HttpException(`Upstream docs unavailable (${response.status})`, HttpStatus.BAD_GATEWAY);
      }
      const json = await response.json();
      res.setHeader('Content-Type', 'application/json');
      res.send(json);
    } catch (err) {
      if (err instanceof HttpException) throw err;
      throw new HttpException('Could not reach upstream service', HttpStatus.BAD_GATEWAY);
    }
  }
}
