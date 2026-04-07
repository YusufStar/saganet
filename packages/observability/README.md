# @saganet/observability

Shared observability utilities: logging, tracing, metrics.

## LoggerModule

Pino-based structured JSON logging.

## TracingModule

OpenTelemetry auto-instrumentation with OTLP export to Jaeger.

```typescript
// In tracing.ts (import before everything else)
import './tracing';
```

## MetricsModule

Prom-client registry with default Node.js metrics.
