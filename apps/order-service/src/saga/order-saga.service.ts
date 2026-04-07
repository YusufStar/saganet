import { Inject, Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { DATA_SOURCE, OutboxEntity } from '@saganet/db';
import { OrderEntity } from '../order/order.entity';
import { OrderStatus } from '../order/order-status.enum';
import { SagaStateEntity, SagaStep, SagaStatus } from './saga-state.entity';
import { orderCompletionDuration, orderSuccessTotal, orderFailureTotal } from '../metrics/metrics.controller';

@Injectable()
export class OrderSagaService {
  private readonly logger = new Logger(OrderSagaService.name);

  constructor(@Inject(DATA_SOURCE) private readonly dataSource: DataSource) {}

  async onInventoryReserved(orderId: string): Promise<void> {
    const qr = this.dataSource.createQueryRunner();
    await qr.connect(); await qr.startTransaction();
    try {
      const saga = await qr.manager.findOne(SagaStateEntity, { where: { orderId } });
      if (!saga || saga.status !== SagaStatus.RUNNING) return;

      const payload = saga.payload as Record<string, unknown>;

      await qr.manager.update(SagaStateEntity, saga.id, {
        step: SagaStep.INVENTORY_RESERVED,
      });
      await qr.manager.update(OrderEntity, orderId, { status: OrderStatus.CONFIRMED });

      // Send payment charge command
      await qr.manager.save(OutboxEntity, {
        topic: 'payment.charge',
        payload: {
          orderId,
          userId: payload['userId'],
          amount: payload['totalAmount'],
        },
      });
      await qr.manager.update(SagaStateEntity, saga.id, { step: SagaStep.PAYMENT_CHARGE_SENT });

      await qr.commitTransaction();
      this.logger.log(`Saga[${orderId}]: INVENTORY_RESERVED → PAYMENT_CHARGE_SENT`);
    } catch (err) {
      await qr.rollbackTransaction();
      this.logger.error(`Saga[${orderId}] onInventoryReserved failed`, err);
    } finally {
      await qr.release();
    }
  }

  async onInventoryFailed(orderId: string, reason: string): Promise<void> {
    await this.failSaga(orderId, reason, 'inventory_failed');
  }

  async onPaymentCompleted(orderId: string, startedAt: Date): Promise<void> {
    const qr = this.dataSource.createQueryRunner();
    await qr.connect(); await qr.startTransaction();
    try {
      const saga = await qr.manager.findOne(SagaStateEntity, { where: { orderId } });
      if (!saga || saga.status !== SagaStatus.RUNNING) return;

      await qr.manager.update(SagaStateEntity, saga.id, {
        step: SagaStep.COMPLETED,
        status: SagaStatus.COMPLETED,
      });
      await qr.manager.update(OrderEntity, orderId, { status: OrderStatus.COMPLETED });
      await qr.manager.save(OutboxEntity, {
        topic: 'order.completed',
        payload: { orderId },
      });

      await qr.commitTransaction();

      // Metrics
      const durationSec = (Date.now() - startedAt.getTime()) / 1000;
      orderCompletionDuration.observe(durationSec);
      orderSuccessTotal.inc();
      this.logger.log(`Saga[${orderId}]: COMPLETED in ${durationSec.toFixed(1)}s`);
    } catch (err) {
      await qr.rollbackTransaction();
      this.logger.error(`Saga[${orderId}] onPaymentCompleted failed`, err);
    } finally {
      await qr.release();
    }
  }

  async onPaymentFailed(orderId: string, reason: string): Promise<void> {
    const qr = this.dataSource.createQueryRunner();
    await qr.connect(); await qr.startTransaction();
    try {
      const saga = await qr.manager.findOne(SagaStateEntity, { where: { orderId } });
      if (!saga || saga.status !== SagaStatus.RUNNING) return;

      const payload = saga.payload as Record<string, unknown>;

      await qr.manager.update(SagaStateEntity, saga.id, {
        step: SagaStep.COMPENSATING,
        status: SagaStatus.FAILED,
      });

      // Compensation: release inventory
      await qr.manager.save(OutboxEntity, {
        topic: 'inventory.release',
        payload: {
          orderId,
          items: (payload['items'] as any[]).map((i: any) => ({
            productId: i.productId,
            quantity: i.quantity,
          })),
        },
      });
      await qr.manager.update(OrderEntity, orderId, { status: OrderStatus.FAILED });
      await qr.manager.save(OutboxEntity, {
        topic: 'order.failed',
        payload: { orderId, reason },
      });

      await qr.commitTransaction();
      orderFailureTotal.labels('payment_failed').inc();
      this.logger.warn(`Saga[${orderId}]: PAYMENT_FAILED → compensation sent`);
    } catch (err) {
      await qr.rollbackTransaction();
      this.logger.error(`Saga[${orderId}] onPaymentFailed failed`, err);
    } finally {
      await qr.release();
    }
  }

  async compensateTimedOut(orderId: string): Promise<void> {
    await this.failSaga(orderId, 'saga_timeout', 'timeout');
  }

  private async failSaga(orderId: string, reason: string, metricLabel: string): Promise<void> {
    const qr = this.dataSource.createQueryRunner();
    await qr.connect(); await qr.startTransaction();
    try {
      const saga = await qr.manager.findOne(SagaStateEntity, { where: { orderId } });
      if (!saga || saga.status !== SagaStatus.RUNNING) return;

      await qr.manager.update(SagaStateEntity, saga.id, {
        step: SagaStep.FAILED,
        status: SagaStatus.FAILED,
      });
      await qr.manager.update(OrderEntity, orderId, { status: OrderStatus.FAILED });
      await qr.manager.save(OutboxEntity, {
        topic: 'order.failed',
        payload: { orderId, reason },
      });

      await qr.commitTransaction();
      orderFailureTotal.labels(metricLabel).inc();
      this.logger.warn(`Saga[${orderId}]: FAILED — ${reason}`);
    } catch (err) {
      await qr.rollbackTransaction();
      this.logger.error(`failSaga[${orderId}] error`, err);
    } finally {
      await qr.release();
    }
  }
}
