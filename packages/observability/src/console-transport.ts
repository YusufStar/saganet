import { Writable } from 'node:stream';

export function createConsoleStream(): Writable {
  return new Writable({
    write(chunk: Buffer, _enc: string, cb: () => void) {
      try {
        const obj = JSON.parse(chunk.toString()) as Record<string, unknown>;
        const req = obj['req'] as Record<string, unknown> | undefined;
        const method = (obj['method'] as string | undefined) ?? (req?.['method'] as string | undefined);
        const url = (obj['url'] as string | undefined) ?? (req?.['url'] as string | undefined);
        if (method && url) {
          process.stdout.write(`${method} ${url}\n`);
        }
      } catch {}
      cb();
    },
  });
}
