import { Body, Controller, ForbiddenException, Get, NotFoundException, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Inject } from '@nestjs/common';
import { Request } from 'express';
import { DataSource } from 'typeorm';
import { DATA_SOURCE, OutboxEntity } from '@saganet/db';
import { PaymentService } from './payment.service';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles, UserRole } from '../common/decorators/roles.decorator';
import { PaymentListQueryDto } from './dto/payment-list-query.dto';

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
  @Roles(UserRole.CUSTOMER, UserRole.ADMIN, UserRole.VENDOR)
  async findByOrderId(@Param('orderId') orderId: string, @Req() req: Request) {
    const payment = await this.paymentService.findByOrderId(orderId);
    if (!payment) throw new NotFoundException('Payment not found');
    const role = req.headers['x-user-role'] as string;
    const userId = req.headers['x-user-id'] as string;
    if (role !== 'ADMIN' && payment.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }
    return payment;
  }

  @Get()
  @Roles(UserRole.ADMIN)
  async findAll(@Query() query: PaymentListQueryDto) {
    return this.paymentService.findAllPaginated(query);
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
