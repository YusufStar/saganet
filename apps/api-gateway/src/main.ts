import { otelSdk } from './tracing';
otelSdk.start();

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

  app.use(cookieParser());
  app.use(pinoHttp({ logger }));
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.enableShutdownHooks();

  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Saganet API Gateway')
      .setDescription('Single entry point for all services')
      .setVersion('1.0')
      .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'access-token')
      .addCookieAuth('session_id')
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document, {
      swaggerOptions: { persistAuthorization: true },
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
