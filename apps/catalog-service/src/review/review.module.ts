import { Module } from '@nestjs/common';
import { ReviewController } from './review.controller';
import { ReviewService } from './review.service';
import { OrderCompletedConsumer } from './order-completed.consumer';

@Module({
  controllers: [ReviewController],
  providers: [ReviewService, OrderCompletedConsumer],
  exports: [ReviewService],
})
export class ReviewModule {}
