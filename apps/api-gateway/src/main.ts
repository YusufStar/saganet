import 'reflect-metadata';
import * as path from 'path';
import * as cookieParser from 'cookie-parser';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.enableShutdownHooks();

  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Saganet API Gateway')
      .setDescription('Tüm servislere tek giriş noktası')
      .setVersion('1.0')
      .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'access-token')
      .addCookieAuth('session_id')
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document, {
      swaggerOptions: { persistAuthorization: true },
    });
    console.log(
      `[api-gateway] Swagger UI: http://localhost:${process.env.API_GATEWAY_PORT ?? 3000}/docs`,
    );
  }

  const port = process.env.API_GATEWAY_PORT ?? 3000;
  await app.listen(port);
  console.log(`[api-gateway] listening on port ${port}`);
}
bootstrap();
