import { otelSdk } from './tracing';
otelSdk.start();
import { EventEmitter } from 'events';
EventEmitter.defaultMaxListeners = 0; // suppress false-positive memory leak warnings on ServerResponse

import 'reflect-metadata';
import cookieParser from 'cookie-parser';
import pinoHttp from 'pino-http';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { logger } from '@saganet/observability';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.getHttpServer().setMaxListeners(0); // unlimited — HTTP servers handle many concurrent requests

  app.useLogger({
    log: (msg: string) => logger.info(msg),
    error: (msg: string, trace?: string) => logger.error({ msg, trace }),
    warn: (msg: string) => logger.warn(msg),
    debug: (msg: string) => logger.debug(msg),
    verbose: (msg: string) => logger.trace(msg),
    fatal: (msg: string) => logger.fatal(msg),
  });

  app.use(cookieParser());
  app.use(pinoHttp({ logger, autoLogging: { ignore: (req) => req.url === '/metrics' } }));
  app.setGlobalPrefix('api', { exclude: ['metrics'] });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.enableShutdownHooks();

  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Auth Service')
      .setDescription('Authentication, session management and token verification')
      .setVersion('1.0')
      .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'access-token')
      .addCookieAuth('session_id')
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document, {
      swaggerOptions: { persistAuthorization: true },
    });
    logger.info(`[auth-service] Swagger UI: http://localhost:${process.env.AUTH_SERVICE_PORT ?? 3001}/docs`);
  }

  const port = process.env.AUTH_SERVICE_PORT ?? 3001;
  await app.listen(port);
  logger.info(`[auth-service] listening on port ${port}`);
}
bootstrap();
