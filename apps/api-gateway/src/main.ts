import { otelSdk } from './tracing';
otelSdk.start();

import { EventEmitter } from 'events';
EventEmitter.defaultMaxListeners = 0;

import 'reflect-metadata';
import cookieParser from 'cookie-parser';
import pinoHttp from 'pino-http';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { logger } from '@saganet/observability';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.getHttpServer().setMaxListeners(0); // unlimited — HTTP servers handle many concurrent requests

  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.set('trust proxy', 1);

  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') ?? ['http://localhost:3333', 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-idempotency-key', 'x-request-id', 'Cookie'],
  });

  app.use(cookieParser());
  app.use(pinoHttp({ logger, autoLogging: { ignore: (req) => req.url === '/metrics' } }));
  app.setGlobalPrefix('api', { exclude: ['metrics'] });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.enableShutdownHooks();

  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Saganet — API Gateway')
      .setDescription('Single entry point. Use the dropdown above to switch between services.')
      .setVersion('1.0')
      .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'access-token')
      .addCookieAuth('session_id')
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        urls: [
          { url: '/docs-json',                    name: '🔀 API Gateway' },
          { url: '/api/swagger-proxy/auth',         name: '🔐 Auth Service' },
          { url: '/api/swagger-proxy/catalog',      name: '📦 Catalog Service' },
          { url: '/api/swagger-proxy/inventory',    name: '🏪 Inventory Service' },
          { url: '/api/swagger-proxy/order',        name: '🛒 Order Service' },
          { url: '/api/swagger-proxy/payment',      name: '💳 Payment Service' },
          { url: '/api/swagger-proxy/notification', name: '🔔 Notification Service' },
        ],
        'urls.primaryName': 'Auth Service',
      },
    });
    logger.info(
      `[api-gateway] Swagger UI: http://localhost:${process.env.API_GATEWAY_PORT ?? 3000}/docs`,
    );
  }

  const port = process.env.API_GATEWAY_PORT ?? 3000;
  await app.listen(port);
  logger.info(`[api-gateway] listening on port ${port}`);
}
bootstrap();
