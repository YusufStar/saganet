import { Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { DATA_SOURCE, OutboxEntity } from '@saganet/db';
import { PaymentEntity } from './payment.entity';
import { PaymentStatus } from './payment-status.enum';
import { MockPaymentProvider } from './providers/mock-payment.provider';
import { CardDetails } from './providers/payment-provider.interface';
import { PaymentListQueryDto } from './dto/payment-list-query.dto';
import { paymentSuccessTotal, paymentFailureTotal, paymentDuration } from '../metrics/metrics.controller';

@Injectable()
export class PaymentService {
  constructor(
    @Inject(DATA_SOURCE) private readonly dataSource: DataSource,
    private readonly provider: MockPaymentProvider,
  ) {}

  // Called by Kafka consumer: payment.charge command
  async charge(orderId: string, userId: string, amount: string, card?: CardDetails): Promise<void> {
    if (process.env.NODE_ENV === 'production') {
      const providerName = this.provider.constructor.name;
      if (providerName === 'MockPaymentProvider') {
        throw new InternalServerErrorException('Mock payment provider cannot be used in production');
      }
    }

    // Idempotency: if already processed, skip
    const existing = await this.dataSource.getRepository(PaymentEntity)
      .findOne({ where: { orderId } });
    if (existing && existing.status !== PaymentStatus.PENDING) return;

    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();
    const start = Date.now();

    try {
      let payment = existing;
      if (!payment) {
        payment = await qr.manager.save(PaymentEntity, {
          orderId, userId, amount, status: PaymentStatus.PENDING, provider: 'mock',
        });
      }

      // Use default test card if none provided (saga flow)
      const cardDetails = card ?? { number: '4242424242424242', expiry: '12/34', cvv: '123' };
      const result = await this.provider.charge(orderId, amount, cardDetails);

      payment.cardLast4 = cardDetails.number.replace(/\s/g, '').slice(-4);

      if (result.success) {
        payment.status = PaymentStatus.COMPLETED;
        await qr.manager.save(PaymentEntity, payment);
        await qr.manager.save(OutboxEntity, {
          topic: 'payment.completed',
          payload: { orderId, userId, amount, transactionId: result.transactionId },
        });
        paymentSuccessTotal.inc();
      } else {
        payment.status = PaymentStatus.FAILED;
        payment.failureReason = result.failureReason;
        await qr.manager.save(PaymentEntity, payment);
        await qr.manager.save(OutboxEntity, {
          topic: 'payment.failed',
          payload: { orderId, userId, amount, reason: result.failureReason },
        });
        paymentFailureTotal.labels(result.failureReason ?? 'unknown').inc();
      }

      await qr.commitTransaction();
      paymentDuration.observe((Date.now() - start) / 1000);
    } catch (err) {
      await qr.rollbackTransaction();
      throw err;
    } finally {
      await qr.release();
    }
  }

  // Called by Kafka consumer: payment.refund command (compensation)
  async refund(orderId: string): Promise<void> {
    const payment = await this.dataSource.getRepository(PaymentEntity)
      .findOne({ where: { orderId, status: PaymentStatus.COMPLETED } });
    if (!payment) return; // nothing to refund

    // Idempotency: already refunded
    if (payment.status === PaymentStatus.REFUNDED) return;

    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();
    try {
      await this.provider.refund(orderId, payment.amount);
      payment.status = PaymentStatus.REFUNDED;
      await qr.manager.save(PaymentEntity, payment);
      await qr.manager.save(OutboxEntity, {
        topic: 'payment.refunded',
        payload: { orderId, userId: payment.userId, amount: payment.amount },
      });
      await qr.commitTransaction();
    } catch (err) {
      await qr.rollbackTransaction();
      throw err;
    } finally {
      await qr.release();
    }
  }

  async findByOrderId(orderId: string): Promise<PaymentEntity | null> {
    return this.dataSource.getRepository(PaymentEntity).findOne({ where: { orderId } });
  }

  async findAll(): Promise<PaymentEntity[]> {
    return this.dataSource.getRepository(PaymentEntity).find({ order: { createdAt: 'DESC' } });
  }

  async findAllPaginated(query: PaymentListQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const qb = this.dataSource
      .getRepository(PaymentEntity)
      .createQueryBuilder('payment');

    if (query.status) {
      qb.andWhere('payment.status = :status', { status: query.status });
    }

    qb.orderBy('payment.createdAt', 'DESC');

    const [data, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
