import { trace, SpanStatusCode } from '@opentelemetry/api';

/**
 * Method decorator that wraps the decorated method in an OpenTelemetry span.
 * Usage: @Trace('MyService.myMethod') or @Trace() (uses class.method name)
 */
export function Trace(spanName?: string): MethodDecorator {
  return function (
    target: object,
    propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<any>,
  ): TypedPropertyDescriptor<any> {
    const originalMethod = descriptor.value as (...args: unknown[]) => unknown;
    const name = spanName ?? `${target.constructor.name}.${String(propertyKey)}`;

    descriptor.value = async function (...args: unknown[]) {
      const tracer = trace.getTracer('saganet');
      return tracer.startActiveSpan(name, async (span) => {
        try {
          const result = await originalMethod.apply(this, args);
          span.setStatus({ code: SpanStatusCode.OK });
          return result;
        } catch (error) {
          span.setStatus({
            code: SpanStatusCode.ERROR,
            message: error instanceof Error ? error.message : String(error),
          });
          span.recordException(error as Error);
          throw error;
        } finally {
          span.end();
        }
      });
    };

    return descriptor;
  };
}
