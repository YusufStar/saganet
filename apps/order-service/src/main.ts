import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.ORDER_SERVICE_PORT ?? 3004;
  await app.listen(port);
  console.log(`[order-service] listening on port ${port}`);
}
bootstrap();
