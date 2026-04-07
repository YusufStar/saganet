import { Body, Controller, Get, NotFoundException, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Inject } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { DATA_SOURCE, OutboxEntity } from '@saganet/db';
import { PaymentService } from './payment.service';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles, UserRole } from '../common/decorators/roles.decorator';
import { PaymentEntity } from './payment.entity';

@ApiTags('Payments')
@ApiBearerAuth('access-token')
@UseGuards(RolesGuard)
@Controller('payments')
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
    @Inject(DATA_SOURCE) private readonly dataSource: DataSource,
  ) {}

  @Get(':orderId')
  @Roles(UserRole.CUSTOMER, UserRole.ADMIN)
  async findByOrderId(@Param('orderId') orderId: string): Promise<PaymentEntity> {
    const payment = await this.paymentService.findByOrderId(orderId);
    if (!payment) throw new NotFoundException(`Payment for order ${orderId} not found`);
    return payment;
  }

  @Get()
  @Roles(UserRole.ADMIN)
  async findAll(): Promise<PaymentEntity[]> {
    return this.paymentService.findAll();
  }

  @Post('webhook/simulate')
  @Roles(UserRole.ADMIN)
  async simulateWebhook(@Body() body: { orderId: string; success: boolean }): Promise<{ ok: boolean }> {
    if (body.success) {
      await this.dataSource.getRepository(OutboxEntity).save({
        topic: 'payment.completed',
        payload: { orderId: body.orderId, simulated: true },
      });
    } else {
      await this.dataSource.getRepository(OutboxEntity).save({
        topic: 'payment.failed',
        payload: { orderId: body.orderId, reason: 'simulated_failure', simulated: true },
      });
    }
    return { ok: true };
  }
}
