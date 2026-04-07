import pino from 'pino';
import { trace } from '@opentelemetry/api';

const isDev = process.env.NODE_ENV !== 'production';

const mixin = () => {
  const span = trace.getActiveSpan();
  if (!span) return {};
  const ctx = span.spanContext();
  if (!ctx.traceId || ctx.traceId === '00000000000000000000000000000000') return {};
  return {
    traceId: ctx.traceId,
    spanId: ctx.spanId,
  };
};

export const logger = pino({
  level: process.env.LOG_LEVEL ?? 'info',
  transport: isDev
    ? { target: 'pino-pretty', options: { colorize: true } }
    : undefined,
  formatters: {
    level: (label) => ({ level: label }),
  },
  base: {
    service: process.env.SERVICE_NAME ?? 'saganet',
  },
  mixin,
});
