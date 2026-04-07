import { Module } from '@nestjs/common';
import { OrderSagaService } from './order-saga.service';
import { SagaTimeoutService } from './saga-timeout.service';

@Module({
  providers: [OrderSagaService, SagaTimeoutService],
  exports: [OrderSagaService],
})
export class SagaModule {}
