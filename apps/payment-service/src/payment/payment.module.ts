import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { PaymentConsumerService } from './payment-consumer.service';
import { MockPaymentProvider } from './providers/mock-payment.provider';

@Module({
  controllers: [PaymentController],
  providers: [PaymentService, PaymentConsumerService, MockPaymentProvider],
})
export class PaymentModule {}
