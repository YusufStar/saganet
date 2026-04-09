import { Module } from '@nestjs/common';
import { VendorApplicationService } from './vendor-application.service';
import {
  VendorApplicationController,
  AdminVendorApplicationController,
} from './vendor-application.controller';

@Module({
  controllers: [VendorApplicationController, AdminVendorApplicationController],
  providers: [VendorApplicationService],
})
export class VendorApplicationModule {}
