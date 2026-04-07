import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { DATA_SOURCE, OutboxEntity } from '@saganet/db';
import { OrderEntity } from './order.entity';
import { OrderItemEntity } from './order-item.entity';
import { OrderStatus } from './order-status.enum';
import { SagaStateEntity, SagaStep, SagaStatus } from '../saga/saga-state.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderResponseDto } from './dto/order-response.dto';
import { OrderListQueryDto } from './dto/order-list-query.dto';

@Injectable()
export class OrderService {
  constructor(@Inject(DATA_SOURCE) private readonly dataSource: DataSource) {}

  async createOrder(
    userId: string,
    dto: CreateOrderDto,
    idempotencyKey?: string,
  ): Promise<OrderResponseDto> {
    // Idempotency check
    if (idempotencyKey) {
      const existing = await this.dataSource.getRepository(OrderEntity).findOne({
        where: { userId, idempotencyKey },
        relations: ['items'],
      });
      if (existing) return this.toDto(existing);
    }

    // Calculate total
    const totalAmount = dto.items
      .reduce((sum, item) => sum + parseFloat(item.unitPrice) * item.quantity, 0)
      .toFixed(2);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Create order
      const order = await queryRunner.manager.save(OrderEntity, {
        userId,
        status: OrderStatus.PENDING,
        addressSnapshot: dto.address,
        totalAmount,
        idempotencyKey: idempotencyKey ?? null,
        items: dto.items.map((item) => ({
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
      });

      // Create saga state
      await queryRunner.manager.save(SagaStateEntity, {
        orderId: order.id,
        step: SagaStep.STARTED,
        status: SagaStatus.RUNNING,
        payload: { userId, items: dto.items, totalAmount },
        timeoutAt: new Date(Date.now() + 5 * 60 * 1000), // 5 min timeout
      });

      // Outbox: order.created + inventory.reserve command
      await queryRunner.manager.save(OutboxEntity, {
        topic: 'order.created',
        payload: { orderId: order.id, userId, totalAmount, items: dto.items },
      });
      await queryRunner.manager.save(OutboxEntity, {
        topic: 'inventory.reserve',
        payload: {
          orderId: order.id,
          items: dto.items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        },
      });

      await queryRunner.commitTransaction();

      const saved = await this.dataSource.getRepository(OrderEntity).findOne({
        where: { id: order.id },
        relations: ['items'],
      });
      return this.toDto(saved!);
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async findOne(orderId: string, userId: string, role: string): Promise<OrderResponseDto> {
    const order = await this.dataSource.getRepository(OrderEntity).findOne({
      where: { id: orderId },
      relations: ['items'],
    });
    if (!order) throw new NotFoundException('Order not found');
    if (role !== 'ADMIN' && order.userId !== userId) throw new ForbiddenException('Not your order');
    return this.toDto(order);
  }

  async findAll(userId: string, role: string, query: OrderListQueryDto): Promise<{
    data: OrderResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    const repo = this.dataSource.getRepository(OrderEntity);
    const { page = 1, limit = 20, status } = query;

    const qb = repo.createQueryBuilder('order').leftJoinAndSelect('order.items', 'items');

    // ADMIN sees all; CUSTOMER/VENDOR sees own
    if (role !== 'ADMIN') qb.where('order.userId = :userId', { userId });
    if (status) qb.andWhere('order.status = :status', { status });

    qb.orderBy('order.createdAt', 'DESC').skip((page - 1) * limit).take(limit);

    const [data, total] = await qb.getManyAndCount();
    return { data: data.map(this.toDto), total, page, limit };
  }

  async cancelOrder(orderId: string, userId: string, role: string): Promise<OrderResponseDto> {
    const repo = this.dataSource.getRepository(OrderEntity);
    const order = await repo.findOne({ where: { id: orderId }, relations: ['items'] });

    if (!order) throw new NotFoundException('Order not found');
    if (role !== 'ADMIN' && order.userId !== userId) throw new ForbiddenException('Not your order');
    if (![OrderStatus.PENDING, OrderStatus.CONFIRMED].includes(order.status)) {
      throw new BadRequestException(`Cannot cancel order in status: ${order.status}`);
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.update(OrderEntity, orderId, { status: OrderStatus.CANCELLED });
      await queryRunner.manager.save(OutboxEntity, {
        topic: 'order.cancelled',
        payload: { orderId, userId: order.userId },
      });
      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }

    order.status = OrderStatus.CANCELLED;
    return this.toDto(order);
  }

  toDto(order: OrderEntity): OrderResponseDto {
    return {
      id: order.id,
      userId: order.userId,
      status: order.status,
      totalAmount: order.totalAmount,
      addressSnapshot: order.addressSnapshot as Record<string, unknown>,
      items: (order.items ?? []).map((item) => ({
        id: item.id,
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })),
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }
}
