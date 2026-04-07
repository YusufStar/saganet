import { Injectable, Logger, OnModuleDestroy, OnModuleInit, Inject } from '@nestjs/common';
import { DataSource, LessThan } from 'typeorm';
import { DATA_SOURCE } from '@saganet/db';
import { SagaStateEntity, SagaStatus } from './saga-state.entity';
import { OrderSagaService } from './order-saga.service';

@Injectable()
export class SagaTimeoutService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(SagaTimeoutService.name);
  private timer: ReturnType<typeof setInterval> | null = null;

  constructor(
    @Inject(DATA_SOURCE) private readonly dataSource: DataSource,
    private readonly sagaService: OrderSagaService,
  ) {}

  onModuleInit(): void {
    // Check for timed-out sagas every 30 seconds
    this.timer = setInterval(() => this.checkTimeouts().catch((e) => this.logger.error(e)), 30_000);
  }

  onModuleDestroy(): void {
    if (this.timer) clearInterval(this.timer);
  }

  private async checkTimeouts(): Promise<void> {
    const repo = this.dataSource.getRepository(SagaStateEntity);
    const timedOut = await repo.find({
      where: {
        status: SagaStatus.RUNNING,
        timeoutAt: LessThan(new Date()),
      },
      take: 20,
    });

    for (const saga of timedOut) {
      this.logger.warn(`Saga timeout: orderId=${saga.orderId}`);
      await this.sagaService.compensateTimedOut(saga.orderId);
    }
  }
}
