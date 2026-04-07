import { DynamicModule, Module, Injectable, OnModuleInit } from '@nestjs/common';
import { Registry, collectDefaultMetrics } from 'prom-client';

export const METRICS_REGISTRY = 'METRICS_REGISTRY';

@Injectable()
export class MetricsRegistry implements OnModuleInit {
  readonly registry = new Registry();

  onModuleInit() {
    collectDefaultMetrics({ register: this.registry });
  }
}

export interface MetricsModuleOptions {
  defaultMetrics?: boolean;
}

@Module({})
export class MetricsModule {
  static forRoot(_options: MetricsModuleOptions = {}): DynamicModule {
    return {
      module: MetricsModule,
      global: true,
      providers: [MetricsRegistry],
      exports: [MetricsRegistry],
    };
  }
}
