import { Inject, Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { DataSource, IsNull } from 'typeorm';
import { DATA_SOURCE, OutboxEntity } from '@saganet/db';
import { KAFKA_CLIENT } from '@saganet/kafka';
import { Kafka, Producer } from 'kafkajs';

@Injectable()
export class OutboxRelayService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(OutboxRelayService.name);
  private timer: ReturnType<typeof setInterval> | null = null;
  private kafkaProducer: Producer;

  constructor(
    @Inject(DATA_SOURCE) private readonly dataSource: DataSource,
    @Inject(KAFKA_CLIENT) private readonly kafka: Kafka,
  ) {}

  async onModuleInit() {
    this.kafkaProducer = this.kafka.producer();
    await this.kafkaProducer.connect();
    this.timer = setInterval(() => this.relay().catch(e => this.logger.error(e)), 500);
  }

  async onModuleDestroy() {
    if (this.timer) clearInterval(this.timer);
    await this.kafkaProducer?.disconnect();
  }

  private async relay() {
    await this.dataSource.transaction(async (em) => {
      // SELECT FOR UPDATE SKIP LOCKED prevents duplicate processing across intervals/instances
      const pending: OutboxEntity[] = await em
        .getRepository(OutboxEntity)
        .createQueryBuilder('outbox')
        .where('outbox.sentAt IS NULL')
        .orderBy('outbox.createdAt', 'ASC')
        .limit(50)
        .setLock('pessimistic_write', undefined, ['outbox'])
        .getMany();

      if (!pending.length) return;

      for (const event of pending) {
        try {
          // Mark as sent BEFORE publishing to prevent re-processing on next tick
          await em.getRepository(OutboxEntity).update(event.id, { sentAt: new Date() });

          await this.kafkaProducer.send({
            topic: event.topic,
            messages: [{ key: event.id, value: JSON.stringify(event.payload) }],
          });
        } catch (err) {
          // Rollback sentAt so it gets retried next cycle
          await em.getRepository(OutboxEntity).update(event.id, { sentAt: null as unknown as Date });
          this.logger.error({ msg: 'Outbox relay failed', eventId: event.id, err });
        }
      }
    });
  }
}
