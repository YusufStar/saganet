import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { OrderConsumerService } from './order-consumer.service';
import { SagaModule } from '../saga/saga.module';

@Module({
  imports: [SagaModule],
  controllers: [OrderController],
  providers: [OrderService, OrderConsumerService],
  exports: [OrderService],
})
export class OrderModule {}
