import { Test, TestingModule } from '@nestjs/testing';
import { DataSource, EntityManager, QueryRunner, Repository } from 'typeorm';
import { DATA_SOURCE, OutboxEntity } from '@saganet/db';
import { PaymentService } from '../payment.service';
import { MockPaymentProvider } from '../providers/mock-payment.provider';
import { PaymentEntity } from '../payment.entity';
import { PaymentStatus } from '../payment-status.enum';

const makePayment = (overrides: Partial<PaymentEntity> = {}): PaymentEntity => ({
  id: 'pay-1',
  orderId: 'order-1',
  userId: 'user-1',
  amount: '100.00',
  currency: 'TRY',
  status: PaymentStatus.PENDING,
  provider: 'mock',
  cardLast4: undefined,
  failureReason: undefined,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
} as PaymentEntity);

const makeQueryRunner = (saveImpl?: jest.Mock) => {
  const saved: unknown[] = [];
  const manager = {
    save: saveImpl ?? jest.fn().mockImplementation(async (_entity: unknown, data: unknown) => {
      const obj = { id: `gen-${saved.length}`, ...data as object };
      saved.push(obj);
      return obj;
    }),
  } as unknown as EntityManager;

  const qr = {
    connect: jest.fn().mockResolvedValue(undefined),
    startTransaction: jest.fn().mockResolvedValue(undefined),
    commitTransaction: jest.fn().mockResolvedValue(undefined),
    rollbackTransaction: jest.fn().mockResolvedValue(undefined),
    release: jest.fn().mockResolvedValue(undefined),
    manager,
  } as unknown as QueryRunner;

  return { qr, saved, manager };
};

describe('PaymentService', () => {
  let service: PaymentService;
  let mockProvider: jest.Mocked<MockPaymentProvider>;
  let mockDataSource: jest.Mocked<DataSource>;
  let paymentRepo: jest.Mocked<Repository<PaymentEntity>>;

  beforeEach(async () => {
    paymentRepo = {
      findOne: jest.fn(),
      find: jest.fn(),
    } as unknown as jest.Mocked<Repository<PaymentEntity>>;

    mockProvider = {
      charge: jest.fn(),
      refund: jest.fn(),
    } as unknown as jest.Mocked<MockPaymentProvider>;

    mockDataSource = {
      getRepository: jest.fn().mockReturnValue(paymentRepo),
      createQueryRunner: jest.fn(),
    } as unknown as jest.Mocked<DataSource>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentService,
        { provide: DATA_SOURCE, useValue: mockDataSource },
        { provide: MockPaymentProvider, useValue: mockProvider },
      ],
    }).compile();

    service = module.get<PaymentService>(PaymentService);
  });

  it('charge with valid mock card → COMPLETED + outbox payment.completed', async () => {
    paymentRepo.findOne.mockResolvedValue(null);
    mockProvider.charge.mockResolvedValue({ success: true, transactionId: 'mock_txn_123' });

    const saveMock = jest.fn().mockImplementation(async (_entity: unknown, data: unknown) => ({ id: 'gen-1', ...data as object }));
    const { qr } = makeQueryRunner(saveMock);
    mockDataSource.createQueryRunner.mockReturnValue(qr);

    await service.charge('order-1', 'user-1', '100.00');

    expect(saveMock).toHaveBeenCalledWith(
      PaymentEntity,
      expect.objectContaining({ status: PaymentStatus.COMPLETED }),
    );
    expect(saveMock).toHaveBeenCalledWith(
      OutboxEntity,
      expect.objectContaining({ topic: 'payment.completed' }),
    );
    expect(qr.commitTransaction).toHaveBeenCalled();
  });

  it('charge with invalid card → FAILED + outbox payment.failed + failureReason set', async () => {
    paymentRepo.findOne.mockResolvedValue(null);
    mockProvider.charge.mockResolvedValue({ success: false, failureReason: 'card_declined' });

    const saveMock = jest.fn().mockImplementation(async (_entity: unknown, data: unknown) => ({ id: 'gen-1', ...data as object }));
    const { qr } = makeQueryRunner(saveMock);
    mockDataSource.createQueryRunner.mockReturnValue(qr);

    await service.charge('order-2', 'user-1', '50.00', { number: '1234123412341234', expiry: '01/25', cvv: '999' });

    expect(saveMock).toHaveBeenCalledWith(
      PaymentEntity,
      expect.objectContaining({ status: PaymentStatus.FAILED, failureReason: 'card_declined' }),
    );
    expect(saveMock).toHaveBeenCalledWith(
      OutboxEntity,
      expect.objectContaining({ topic: 'payment.failed' }),
    );
  });

  it('charge idempotency → already COMPLETED, returns without processing', async () => {
    paymentRepo.findOne.mockResolvedValue(makePayment({ status: PaymentStatus.COMPLETED }));

    await service.charge('order-1', 'user-1', '100.00');

    expect(mockProvider.charge).not.toHaveBeenCalled();
    expect(mockDataSource.createQueryRunner).not.toHaveBeenCalled();
  });

  it('refund → REFUNDED + outbox payment.refunded', async () => {
    const completedPayment = makePayment({ status: PaymentStatus.COMPLETED });
    // findOne is called with status COMPLETED filter
    paymentRepo.findOne.mockResolvedValue(completedPayment);
    mockProvider.refund.mockResolvedValue({ success: true });

    const saveMock = jest.fn().mockImplementation(async (_entity: unknown, data: unknown) => ({ id: 'gen-1', ...data as object }));
    const { qr } = makeQueryRunner(saveMock);
    mockDataSource.createQueryRunner.mockReturnValue(qr);

    await service.refund('order-1');

    expect(saveMock).toHaveBeenCalledWith(
      PaymentEntity,
      expect.objectContaining({ status: PaymentStatus.REFUNDED }),
    );
    expect(saveMock).toHaveBeenCalledWith(
      OutboxEntity,
      expect.objectContaining({ topic: 'payment.refunded' }),
    );
    expect(qr.commitTransaction).toHaveBeenCalled();
  });

  it('refund idempotency → payment not found (already refunded or never charged), no-op', async () => {
    // findOne returns null when querying for COMPLETED payments (means nothing to refund)
    paymentRepo.findOne.mockResolvedValue(null);

    await service.refund('order-99');

    expect(mockProvider.refund).not.toHaveBeenCalled();
    expect(mockDataSource.createQueryRunner).not.toHaveBeenCalled();
  });
});
