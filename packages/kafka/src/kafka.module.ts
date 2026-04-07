import { DynamicModule, Module } from '@nestjs/common';
import { Kafka } from 'kafkajs';
import { createKafka, KafkaConfig } from './kafka.factory';

export const KAFKA_CLIENT = 'KAFKA_CLIENT';

@Module({})
export class KafkaModule {
  static forRoot(config: KafkaConfig = {}): DynamicModule {
    const kafkaProvider = {
      provide: KAFKA_CLIENT,
      useFactory: (): Kafka => createKafka(config),
    };

    return {
      module: KafkaModule,
      global: true,
      providers: [kafkaProvider],
      exports: [KAFKA_CLIENT],
    };
  }
}
