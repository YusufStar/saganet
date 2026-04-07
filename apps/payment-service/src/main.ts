import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PAYMENT_SERVICE_PORT ?? 3005;
  await app.listen(port);
  console.log(`[payment-service] listening on port ${port}`);
}
bootstrap();
