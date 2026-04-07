import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.API_GATEWAY_PORT ?? 3000;
  await app.listen(port);
  console.log(`[api-gateway] listening on port ${port}`);
}
bootstrap();
