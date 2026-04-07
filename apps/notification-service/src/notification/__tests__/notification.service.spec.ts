import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { getQueueToken } from '@nestjs/bullmq';
import { NotificationService } from '../notification.service';
import { MetricsService } from '../../metrics/metrics.service';
import { NOTIFICATION_QUEUE } from '../notification.queue';
import { KAFKA_CLIENT } from '@saganet/kafka';

describe('NotificationService', () => {
  let service: NotificationService;
  let mockQueue: { add: jest.Mock };
  let mockMetrics: { notificationsSent: { inc: jest.Mock }; notificationsFailed: { inc: jest.Mock } };

  const mockKafka = {
    consumer: jest.fn().mockReturnValue({
      connect: jest.fn(),
      disconnect: jest.fn(),
      subscribe: jest.fn(),
      run: jest.fn(),
    }),
  };

  beforeEach(async () => {
    mockQueue = { add: jest.fn().mockResolvedValue(undefined) };
    mockMetrics = {
      notificationsSent: { inc: jest.fn() },
      notificationsFailed: { inc: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        { provide: KAFKA_CLIENT, useValue: mockKafka },
        { provide: getQueueToken(NOTIFICATION_QUEUE), useValue: mockQueue },
        { provide: ConfigService, useValue: { get: jest.fn().mockReturnValue('http://localhost:3000') } },
        { provide: MetricsService, useValue: mockMetrics },
      ],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should enqueue order.created job', async () => {
    const handler = (service as any).handleOrderCreated.bind(service);
    await handler({
      orderId: 'order-1',
      userId: 'user-1',
      userEmail: 'test@example.com',
      totalAmount: 99.99,
      currency: 'TRY',
    });

    expect(mockQueue.add).toHaveBeenCalledWith(
      'order.created',
      expect.objectContaining({
        to: 'test@example.com',
        type: 'order.created',
        userId: 'user-1',
      }),
    );
    expect(mockMetrics.notificationsSent.inc).toHaveBeenCalledWith({ type: 'order.created' });
  });

  it('should enqueue order.completed job', async () => {
    const handler = (service as any).handleOrderCompleted.bind(service);
    await handler({ orderId: 'order-1', userId: 'user-1', userEmail: 'test@example.com' });

    expect(mockQueue.add).toHaveBeenCalledWith(
      'order.completed',
      expect.objectContaining({ to: 'test@example.com', type: 'order.completed' }),
    );
  });

  it('should enqueue order.failed job', async () => {
    const handler = (service as any).handleOrderFailed.bind(service);
    await handler({ orderId: 'order-1', userId: 'user-1', userEmail: 'test@example.com', reason: 'Out of stock' });

    expect(mockQueue.add).toHaveBeenCalledWith(
      'order.failed',
      expect.objectContaining({ to: 'test@example.com', type: 'order.failed' }),
    );
  });

  it('should enqueue payment.completed job', async () => {
    const handler = (service as any).handlePaymentCompleted.bind(service);
    await handler({
      orderId: 'order-1',
      userId: 'user-1',
      userEmail: 'test@example.com',
      amount: 50.0,
      currency: 'TRY',
    });

    expect(mockQueue.add).toHaveBeenCalledWith(
      'payment.completed',
      expect.objectContaining({ to: 'test@example.com', type: 'payment.completed' }),
    );
  });

  it('should enqueue payment.refunded job', async () => {
    const handler = (service as any).handlePaymentRefunded.bind(service);
    await handler({
      orderId: 'order-1',
      userId: 'user-1',
      userEmail: 'test@example.com',
      amount: 50.0,
      currency: 'TRY',
    });

    expect(mockQueue.add).toHaveBeenCalledWith(
      'payment.refunded',
      expect.objectContaining({ to: 'test@example.com', type: 'payment.refunded' }),
    );
  });

  it('should enqueue user.registered job (verify email)', async () => {
    const handler = (service as any).handleUserRegistered.bind(service);
    await handler({
      userId: 'user-1',
      email: 'test@example.com',
      role: 'customer',
      verificationToken: 'token-123',
    });

    expect(mockQueue.add).toHaveBeenCalledWith(
      'user.registered',
      expect.objectContaining({ to: 'test@example.com', type: 'user.registered' }),
    );
  });

  it('should enqueue user.password-reset-requested job', async () => {
    const handler = (service as any).handlePasswordResetRequested.bind(service);
    await handler({
      userId: 'user-1',
      email: 'test@example.com',
      resetToken: 'reset-token-123',
    });

    expect(mockQueue.add).toHaveBeenCalledWith(
      'user.password-reset-requested',
      expect.objectContaining({ to: 'test@example.com', type: 'user.password-reset-requested' }),
    );
  });

  it('should increment failed counter when queue add fails', async () => {
    mockQueue.add.mockRejectedValueOnce(new Error('Queue down'));

    const handler = (service as any).handleOrderCreated.bind(service);
    await handler({
      orderId: 'order-1',
      userId: 'user-1',
      userEmail: 'test@example.com',
      totalAmount: 99.99,
      currency: 'TRY',
    });

    expect(mockMetrics.notificationsFailed.inc).toHaveBeenCalledWith({ type: 'order.created' });
  });
});
