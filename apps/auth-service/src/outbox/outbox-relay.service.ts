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
    const repo = this.dataSource.getRepository(OutboxEntity);
    const pending = await repo.find({ where: { sentAt: IsNull() }, take: 50, order: { createdAt: 'ASC' } });
    if (!pending.length) return;

    for (const event of pending) {
      try {
        await this.kafkaProducer.send({
          topic: event.topic,
          messages: [{ key: event.id, value: JSON.stringify(event.payload) }],
        });
        await repo.update(event.id, { sentAt: new Date() });
      } catch (err) {
        this.logger.error({ msg: 'Outbox relay failed', eventId: event.id, err });
      }
    }
  }
}
