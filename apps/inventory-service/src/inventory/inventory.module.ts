import { Module } from '@nestjs/common';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';
import { InventoryConsumerService } from './inventory-consumer.service';

@Module({
  controllers: [InventoryController],
  providers: [InventoryService, InventoryConsumerService],
  exports: [InventoryService],
})
export class InventoryModule {}
