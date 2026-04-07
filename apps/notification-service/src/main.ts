import { otelSdk } from './tracing';
otelSdk.start();
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
  app.enableShutdownHooks();

  const port = process.env.NOTIFICATION_SERVICE_PORT ?? 3006;
  await app.listen(port);
  console.log(`[notification-service] listening on port ${port}`);
}
bootstrap();
