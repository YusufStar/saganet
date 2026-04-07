import { DynamicModule, Module } from '@nestjs/common';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';

export interface TracingModuleOptions {
  serviceName: string;
  endpoint?: string;
}

@Module({})
export class TracingModule {
  static forRoot(options: TracingModuleOptions): DynamicModule {
    const sdk = new NodeSDK({
      resource: resourceFromAttributes({ [ATTR_SERVICE_NAME]: options.serviceName }),
      traceExporter: new OTLPTraceExporter({
        url: options.endpoint ?? process.env.OTEL_EXPORTER_OTLP_ENDPOINT ?? 'http://localhost:4318/v1/traces',
      }),
      instrumentations: [getNodeAutoInstrumentations()],
    });
    sdk.start();

    return {
      module: TracingModule,
      global: true,
    };
  }
}
