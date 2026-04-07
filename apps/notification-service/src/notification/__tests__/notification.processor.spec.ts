import { Test, TestingModule } from '@nestjs/testing';
import { Job } from 'bullmq';
import { NotificationProcessor, NotificationJob } from '../notification.queue';
import { MAILER } from '@saganet/smtp';

describe('NotificationProcessor', () => {
  let processor: NotificationProcessor;
  let mockMailer: { send: jest.Mock };

  beforeEach(async () => {
    mockMailer = { send: jest.fn().mockResolvedValue(undefined) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationProcessor,
        { provide: MAILER, useValue: mockMailer },
      ],
    }).compile();

    processor = module.get<NotificationProcessor>(NotificationProcessor);
  });

  it('should be defined', () => {
    expect(processor).toBeDefined();
  });

  it('should call mailer.send with correct params', async () => {
    const job = {
      id: 'job-1',
      data: {
        to: 'test@example.com',
        subject: 'Test Subject',
        html: '<p>Test</p>',
        type: 'order.created',
        userId: 'user-1',
      },
    } as Job<NotificationJob>;

    await processor.process(job);

    expect(mockMailer.send).toHaveBeenCalledWith({
      to: 'test@example.com',
      subject: 'Test Subject',
      html: '<p>Test</p>',
    });
  });

  it('should throw error when mailer fails (for retry)', async () => {
    mockMailer.send.mockRejectedValueOnce(new Error('SMTP connection failed'));

    const job = {
      id: 'job-2',
      data: {
        to: 'test@example.com',
        subject: 'Test',
        html: '<p>Test</p>',
        type: 'order.created',
      },
    } as Job<NotificationJob>;

    await expect(processor.process(job)).rejects.toThrow('SMTP connection failed');
  });
});
