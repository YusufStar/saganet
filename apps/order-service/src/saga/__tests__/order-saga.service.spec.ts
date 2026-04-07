import { Test, TestingModule } from '@nestjs/testing';
import { DATA_SOURCE } from '@saganet/db';
import { OrderSagaService } from '../order-saga.service';
import { SagaStatus, SagaStep } from '../saga-state.entity';
import { OrderStatus } from '../../order/order-status.enum';

const mockSaga = {
  id: 'saga-uuid',
  orderId: 'order-uuid',
  step: SagaStep.INVENTORY_RESERVE_SENT,
  status: SagaStatus.RUNNING,
  payload: { userId: 'user-uuid', items: [{ productId: 'p1', quantity: 2 }], totalAmount: '59.98' },
  createdAt: new Date(),
};

const mockQR = {
  connect: jest.fn().mockResolvedValue(undefined),
  startTransaction: jest.fn().mockResolvedValue(undefined),
  commitTransaction: jest.fn().mockResolvedValue(undefined),
  rollbackTransaction: jest.fn().mockResolvedValue(undefined),
  release: jest.fn().mockResolvedValue(undefined),
  manager: {
    findOne: jest.fn().mockResolvedValue(mockSaga),
    update: jest.fn().mockResolvedValue(undefined),
    save: jest.fn().mockResolvedValue(undefined),
  },
};

const mockDS = { createQueryRunner: jest.fn().mockReturnValue(mockQR) };

describe('OrderSagaService', () => {
  let service: OrderSagaService;

  beforeEach(async () => {
    jest.clearAllMocks();
    mockQR.manager.findOne.mockResolvedValue(mockSaga);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderSagaService,
        { provide: DATA_SOURCE, useValue: mockDS },
      ],
    }).compile();
    service = module.get<OrderSagaService>(OrderSagaService);
  });

  it('onInventoryReserved advances saga to PAYMENT_CHARGE_SENT', async () => {
    await service.onInventoryReserved('order-uuid');
    expect(mockQR.manager.update).toHaveBeenCalledWith(
      expect.anything(), 'saga-uuid',
      expect.objectContaining({ step: SagaStep.PAYMENT_CHARGE_SENT }),
    );
    expect(mockQR.manager.update).toHaveBeenCalledWith(
      expect.anything(), 'order-uuid',
      expect.objectContaining({ status: OrderStatus.CONFIRMED }),
    );
  });

  it('onPaymentFailed sets COMPENSATING and emits inventory.release', async () => {
    await service.onPaymentFailed('order-uuid', 'card_declined');
    expect(mockQR.manager.save).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ topic: 'inventory.release' }),
    );
    expect(mockQR.manager.update).toHaveBeenCalledWith(
      expect.anything(), 'order-uuid',
      expect.objectContaining({ status: OrderStatus.FAILED }),
    );
  });

  it('onInventoryFailed fails saga immediately', async () => {
    await service.onInventoryFailed('order-uuid', 'out_of_stock');
    expect(mockQR.manager.update).toHaveBeenCalledWith(
      expect.anything(), 'saga-uuid',
      expect.objectContaining({ step: SagaStep.FAILED, status: SagaStatus.FAILED }),
    );
  });
});
