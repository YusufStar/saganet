import { Module } from '@nestjs/common';
import { StockConsumerService } from './stock-consumer.service';

@Module({
  providers: [StockConsumerService],
})
export class StockModule {}
