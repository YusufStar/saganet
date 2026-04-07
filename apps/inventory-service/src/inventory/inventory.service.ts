import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { DATA_SOURCE, OutboxEntity } from '@saganet/db';
import { InventoryEntity } from './inventory.entity';
import { StockLedgerEntity, LedgerType } from './stock-ledger.entity';
import { InventoryResponseDto } from './dto/inventory-response.dto';
import { UpsertInventoryDto } from './dto/upsert-inventory.dto';
import { AdjustInventoryDto } from './dto/adjust-inventory.dto';
import { reservationSuccessTotal, reservationFailureTotal } from '../metrics/metrics.controller';

@Injectable()
export class InventoryService {
  constructor(@Inject(DATA_SOURCE) private readonly dataSource: DataSource) {}

  async findByProductId(productId: string): Promise<InventoryResponseDto> {
    const inv = await this.dataSource
      .getRepository(InventoryEntity)
      .findOne({ where: { productId } });
    if (!inv) throw new NotFoundException(`No inventory for product ${productId}`);
    return this.toDto(inv);
  }

  async findAll(): Promise<InventoryResponseDto[]> {
    const items = await this.dataSource.getRepository(InventoryEntity).find();
    return items.map((i) => this.toDto(i));
  }

  async upsert(dto: UpsertInventoryDto): Promise<InventoryResponseDto> {
    const repo = this.dataSource.getRepository(InventoryEntity);
    let inv = await repo.findOne({ where: { productId: dto.productId } });

    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();
    try {
      if (!inv) {
        inv = await qr.manager.save(InventoryEntity, {
          productId: dto.productId,
          quantity: dto.quantity,
          reserved: 0,
          available: dto.quantity,
        });
      } else {
        const delta = dto.quantity - inv.quantity;
        inv.quantity = dto.quantity;
        inv.available = Math.max(0, inv.available + delta);
        inv = await qr.manager.save(InventoryEntity, inv);
      }
      await qr.manager.save(StockLedgerEntity, {
        productId: dto.productId,
        type: LedgerType.RESTOCK,
        delta: dto.quantity,
      });
      await qr.manager.save(OutboxEntity, {
        topic: 'inventory.stock-updated',
        payload: { productId: dto.productId, available: inv.available, quantity: inv.quantity },
      });
      await qr.commitTransaction();
      return this.toDto(inv);
    } catch (err) {
      await qr.rollbackTransaction();
      throw err;
    } finally {
      await qr.release();
    }
  }

  async adjust(productId: string, dto: AdjustInventoryDto): Promise<InventoryResponseDto> {
    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();
    try {
      const rows = await qr.manager.query(
        `SELECT * FROM inventory WHERE "productId" = $1 FOR UPDATE`,
        [productId],
      );
      const inv = rows[0];
      if (!inv) throw new NotFoundException(`No inventory for product ${productId}`);

      const newQuantity = inv.quantity + dto.delta;
      const newAvailable = inv.available + dto.delta;
      if (newQuantity < 0 || newAvailable < 0) {
        throw new BadRequestException('Adjustment would result in negative stock');
      }

      await qr.manager.query(
        `UPDATE inventory SET quantity = $1, available = $2, "updatedAt" = now() WHERE "productId" = $3`,
        [newQuantity, newAvailable, productId],
      );
      await qr.manager.save(StockLedgerEntity, {
        productId,
        type: LedgerType.ADJUST,
        delta: dto.delta,
      });
      await qr.manager.save(OutboxEntity, {
        topic: 'inventory.stock-updated',
        payload: { productId, available: newAvailable, quantity: newQuantity },
      });
      await qr.commitTransaction();
      return this.toDto({ ...inv, quantity: newQuantity, available: newAvailable });
    } catch (err) {
      await qr.rollbackTransaction();
      throw err;
    } finally {
      await qr.release();
    }
  }

  async reserve(
    orderId: string,
    items: Array<{ productId: string; quantity: number }>,
  ): Promise<'reserved' | 'failed'> {
    const existing = await this.dataSource
      .getRepository(StockLedgerEntity)
      .findOne({ where: { referenceId: orderId, type: LedgerType.RESERVE } });
    if (existing) return 'reserved';

    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();
    try {
      for (const item of items) {
        const rows = await qr.manager.query(
          `SELECT * FROM inventory WHERE "productId" = $1 FOR UPDATE`,
          [item.productId],
        );
        const inv = rows[0];
        if (!inv || inv.available < item.quantity) {
          await qr.rollbackTransaction();
          reservationFailureTotal.inc();
          await this.dataSource.getRepository(OutboxEntity).save({
            topic: 'inventory.reservation-failed',
            payload: {
              orderId,
              productId: item.productId,
              requested: item.quantity,
              available: inv?.available ?? 0,
            },
          });
          return 'failed';
        }
        await qr.manager.query(
          `UPDATE inventory SET reserved = reserved + $1, available = available - $1, "updatedAt" = now() WHERE "productId" = $2`,
          [item.quantity, item.productId],
        );
        await qr.manager.save(StockLedgerEntity, {
          productId: item.productId,
          type: LedgerType.RESERVE,
          delta: -item.quantity,
          referenceId: orderId,
        });
      }
      await qr.manager.save(OutboxEntity, {
        topic: 'inventory.reserved',
        payload: { orderId, items },
      });
      await qr.commitTransaction();
      reservationSuccessTotal.inc();
      return 'reserved';
    } catch (err) {
      await qr.rollbackTransaction();
      throw err;
    } finally {
      await qr.release();
    }
  }

  async release(
    orderId: string,
    items: Array<{ productId: string; quantity: number }>,
  ): Promise<void> {
    const existing = await this.dataSource
      .getRepository(StockLedgerEntity)
      .findOne({ where: { referenceId: orderId, type: LedgerType.RELEASE } });
    if (existing) return;

    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();
    try {
      for (const item of items) {
        await qr.manager.query(
          `UPDATE inventory SET reserved = GREATEST(0, reserved - $1), available = available + $1, "updatedAt" = now() WHERE "productId" = $2`,
          [item.quantity, item.productId],
        );
        await qr.manager.save(StockLedgerEntity, {
          productId: item.productId,
          type: LedgerType.RELEASE,
          delta: item.quantity,
          referenceId: orderId,
        });
      }
      await qr.manager.save(OutboxEntity, {
        topic: 'inventory.released',
        payload: { orderId, items },
      });
      await qr.commitTransaction();
    } catch (err) {
      await qr.rollbackTransaction();
      throw err;
    } finally {
      await qr.release();
    }
  }

  toDto(inv: any): InventoryResponseDto {
    return {
      id: inv.id,
      productId: inv.productId,
      quantity: inv.quantity,
      reserved: inv.reserved,
      available: inv.available,
      version: inv.version,
      createdAt: inv.createdAt,
      updatedAt: inv.updatedAt,
    };
  }
}
