import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { DATA_SOURCE } from '@saganet/db';
import { OrderService } from '../order.service';
import { OrderStatus } from '../order-status.enum';

const mockOrder = {
  id: 'order-uuid',
  userId: 'user-uuid',
  status: OrderStatus.PENDING,
  totalAmount: '59.98',
  addressSnapshot: { fullName: 'Test User', phone: '555', street: 'St 1', city: 'Istanbul', country: 'TR' },
  items: [{ id: 'item-uuid', productId: 'prod-uuid', productName: 'Widget', quantity: 2, unitPrice: '29.99' }],
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
    save: jest.fn().mockImplementation((_entity, data) => Promise.resolve({ ...data, id: 'order-uuid', items: [] })),
    update: jest.fn().mockResolvedValue(undefined),
    findOne: jest.fn().mockResolvedValue(null),
  },
};

const mockRepo = {
  findOne: jest.fn(),
  createQueryBuilder: jest.fn(),
};

const mockDataSource = {
  getRepository: jest.fn().mockReturnValue(mockRepo),
  createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner),
};

describe('OrderService', () => {
  let service: OrderService;

  beforeEach(async () => {
    jest.clearAllMocks();
    mockDataSource.getRepository.mockReturnValue(mockRepo);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        { provide: DATA_SOURCE, useValue: mockDataSource },
      ],
    }).compile();

    service = module.get<OrderService>(OrderService);
  });

  describe('idempotency', () => {
    it('returns existing order when idempotency key matches', async () => {
      mockRepo.findOne.mockResolvedValueOnce(mockOrder);
      const result = await service.createOrder('user-uuid', {
        items: [{ productId: 'prod-uuid', productName: 'Widget', quantity: 2, unitPrice: '29.99' }],
        address: { fullName: 'Test', phone: '555', street: 'St', city: 'City', country: 'TR' },
      }, 'idempotency-key-123');
      expect(result.id).toBe('order-uuid');
      expect(mockQueryRunner.startTransaction).not.toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('throws NotFoundException when order does not exist', async () => {
      mockRepo.findOne.mockResolvedValueOnce(null);
      await expect(service.findOne('nonexistent', 'user-uuid', 'CUSTOMER')).rejects.toThrow(NotFoundException);
    });

    it('throws ForbiddenException when customer tries to access another users order', async () => {
      mockRepo.findOne.mockResolvedValueOnce({ ...mockOrder, userId: 'other-user' });
      await expect(service.findOne('order-uuid', 'user-uuid', 'CUSTOMER')).rejects.toThrow(ForbiddenException);
    });

    it('ADMIN can access any order', async () => {
      mockRepo.findOne.mockResolvedValueOnce({ ...mockOrder, userId: 'other-user' });
      const result = await service.findOne('order-uuid', 'admin-uuid', 'ADMIN');
      expect(result.id).toBe('order-uuid');
    });
  });

  describe('cancelOrder', () => {
    it('throws BadRequestException when order is COMPLETED', async () => {
      mockRepo.findOne.mockResolvedValueOnce({ ...mockOrder, status: OrderStatus.COMPLETED, userId: 'user-uuid' });
      await expect(service.cancelOrder('order-uuid', 'user-uuid', 'CUSTOMER')).rejects.toThrow(BadRequestException);
    });

    it('allows cancelling PENDING order', async () => {
      mockRepo.findOne.mockResolvedValueOnce({ ...mockOrder, status: OrderStatus.PENDING, userId: 'user-uuid' });
      const result = await service.cancelOrder('order-uuid', 'user-uuid', 'CUSTOMER');
      expect(result.status).toBe(OrderStatus.CANCELLED);
    });
  });
});
