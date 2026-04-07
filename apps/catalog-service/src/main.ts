import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.CATALOG_SERVICE_PORT ?? 3002;
  await app.listen(port);
  console.log(`[catalog-service] listening on port ${port}`);
}
bootstrap();
