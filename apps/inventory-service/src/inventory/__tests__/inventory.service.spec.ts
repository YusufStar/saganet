import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { DATA_SOURCE } from '@saganet/db';
import { InventoryService } from '../inventory.service';
import { LedgerType } from '../stock-ledger.entity';

const mockInventory = {
  id: 'inv-uuid',
  productId: 'prod-uuid',
  quantity: 100,
  reserved: 10,
  available: 90,
  version: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockQueryRunner = {
  connect: jest.fn().mockResolvedValue(undefined),
  startTransaction: jest.fn().mockResolvedValue(undefined),
  commitTransaction: jest.fn().mockResolvedValue(undefined),
  rollbackTransaction: jest.fn().mockResolvedValue(undefined),
  release: jest.fn().mockResolvedValue(undefined),
  manager: {
    query: jest.fn(),
    save: jest.fn().mockImplementation((_entity, data) => Promise.resolve({ ...data, id: 'saved-uuid', updatedAt: new Date() })),
  },
};

const mockRepo = {
  findOne: jest.fn(),
  find: jest.fn(),
  save: jest.fn(),
};

const mockDataSource = {
  getRepository: jest.fn().mockReturnValue(mockRepo),
  createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner),
};

describe('InventoryService', () => {
  let service: InventoryService;

  beforeEach(async () => {
    jest.clearAllMocks();
    mockDataSource.getRepository.mockReturnValue(mockRepo);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InventoryService,
        { provide: DATA_SOURCE, useValue: mockDataSource },
      ],
    }).compile();

    service = module.get<InventoryService>(InventoryService);
  });

  describe('reserve', () => {
    it('returns reserved when available stock is sufficient', async () => {
      mockRepo.findOne.mockResolvedValueOnce(null); // no idempotency record
      mockQueryRunner.manager.query.mockResolvedValueOnce([{ ...mockInventory }]);
      mockQueryRunner.manager.save.mockResolvedValue({ id: 'ledger-uuid' });

      const result = await service.reserve('order-1', [{ productId: 'prod-uuid', quantity: 5 }]);

      expect(result).toBe('reserved');
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
    });

    it('returns failed and emits reservation-failed when stock is insufficient', async () => {
      mockRepo.findOne.mockResolvedValueOnce(null); // no idempotency record
      // available = 2, requested = 10
      mockQueryRunner.manager.query.mockResolvedValueOnce([{ ...mockInventory, available: 2 }]);

      const outboxSaveSpy = jest.fn().mockResolvedValue({ id: 'outbox-uuid' });
      mockDataSource.getRepository.mockReturnValueOnce(mockRepo); // StockLedgerEntity repo (idempotency check)
      mockDataSource.getRepository.mockReturnValueOnce({ save: outboxSaveSpy }); // OutboxEntity repo

      const result = await service.reserve('order-2', [{ productId: 'prod-uuid', quantity: 10 }]);

      expect(result).toBe('failed');
      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(outboxSaveSpy).toHaveBeenCalledWith(
        expect.objectContaining({ topic: 'inventory.reservation-failed' }),
      );
    });

    it('is idempotent — returns reserved without DB update when orderId already processed', async () => {
      // Idempotency record exists
      mockRepo.findOne.mockResolvedValueOnce({
        id: 'ledger-uuid',
        referenceId: 'order-1',
        type: LedgerType.RESERVE,
      });

      const result = await service.reserve('order-1', [{ productId: 'prod-uuid', quantity: 5 }]);

      expect(result).toBe('reserved');
      expect(mockQueryRunner.startTransaction).not.toHaveBeenCalled();
    });
  });

  describe('release', () => {
    it('restores available stock on release', async () => {
      mockRepo.findOne.mockResolvedValueOnce(null); // no idempotency record

      await service.release('order-1', [{ productId: 'prod-uuid', quantity: 5 }]);

      expect(mockQueryRunner.manager.query).toHaveBeenCalledWith(
        expect.stringContaining('GREATEST'),
        [5, 'prod-uuid'],
      );
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
    });

    it('is idempotent — skips processing when orderId already released', async () => {
      mockRepo.findOne.mockResolvedValueOnce({
        id: 'ledger-uuid',
        referenceId: 'order-1',
        type: LedgerType.RELEASE,
      });

      await service.release('order-1', [{ productId: 'prod-uuid', quantity: 5 }]);

      expect(mockQueryRunner.startTransaction).not.toHaveBeenCalled();
    });
  });

  describe('findByProductId', () => {
    it('throws NotFoundException when product has no inventory', async () => {
      mockRepo.findOne.mockResolvedValueOnce(null);

      await expect(service.findByProductId('nonexistent-uuid')).rejects.toThrow(NotFoundException);
    });
  });

  describe('adjust', () => {
    it('throws BadRequestException when adjustment results in negative stock', async () => {
      // available = 5, delta = -10 → would go negative
      mockQueryRunner.manager.query.mockResolvedValueOnce([{ ...mockInventory, quantity: 5, available: 5 }]);

      await expect(
        service.adjust('prod-uuid', { delta: -10 }),
      ).rejects.toThrow(BadRequestException);

      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
    });
  });
});
