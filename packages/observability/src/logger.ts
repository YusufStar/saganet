import pino from 'pino';
import path from 'node:path';
import { PassThrough } from 'node:stream';
import { trace } from '@opentelemetry/api';
import { createConsoleStream } from './console-transport';

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

const level = (process.env.LOG_LEVEL ?? 'info') as pino.Level;
const service = process.env.SERVICE_NAME ?? 'app';

// PassThrough buffers logs until pino-roll file stream is ready
const fileBuffer = new PassThrough();

import('pino-roll')
  .then((mod) => {
    const roll = (mod.default ?? mod) as (opts: unknown) => Promise<NodeJS.WritableStream>;
    return roll({
      file: path.join(process.cwd(), 'logs', `${service}.log`),
      frequency: 'daily',
      mkdir: true,
    });
  })
  .then((fileStream) => fileBuffer.pipe(fileStream))
  .catch((err: Error) => process.stderr.write(`[logger] file stream error: ${err.message}\n`));

export const logger = pino(
  {
    level,
    formatters: {
      level: (label) => ({ level: label }),
    },
    base: {
      service: process.env.SERVICE_NAME ?? 'saganet',
    },
    mixin,
  },
  pino.multistream([
    { stream: createConsoleStream(), level },
    { stream: fileBuffer, level },
  ]),
);
