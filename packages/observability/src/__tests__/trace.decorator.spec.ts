const mockSpan = {
  setStatus: jest.fn(),
  recordException: jest.fn(),
  end: jest.fn(),
};

jest.mock('@opentelemetry/api', () => ({
  trace: {
    getTracer: jest.fn().mockReturnValue({
      startActiveSpan: jest.fn().mockImplementation((_name: string, fn: (span: typeof mockSpan) => unknown) => fn(mockSpan)),
    }),
    getActiveSpan: jest.fn().mockReturnValue(null),
  },
  SpanStatusCode: { OK: 1, ERROR: 2 },
  context: {},
}));

import { Trace } from '../trace.decorator';

describe('@Trace() decorator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls the original method and returns its result', async () => {
    class TestService {
      @Trace('TestService.doWork')
      async doWork(): Promise<string> {
        return 'done';
      }
    }

    const svc = new TestService();
    const result = await svc.doWork();
    expect(result).toBe('done');
  });

  it('propagates errors from the decorated method', async () => {
    class TestService {
      @Trace()
      async failingMethod(): Promise<void> {
        throw new Error('method failed');
      }
    }

    const svc = new TestService();
    await expect(svc.failingMethod()).rejects.toThrow('method failed');
  });

  it('ends the span even when method throws', async () => {
    mockSpan.end.mockClear();

    class TestService {
      @Trace()
      async badMethod(): Promise<void> {
        throw new Error('oops');
      }
    }

    const svc = new TestService();
    await expect(svc.badMethod()).rejects.toThrow();
    expect(mockSpan.end).toHaveBeenCalled();
  });

  it('sets OK status on successful execution', async () => {
    mockSpan.setStatus.mockClear();

    class TestService {
      @Trace()
      async goodMethod(): Promise<string> {
        return 'ok';
      }
    }

    const svc = new TestService();
    await svc.goodMethod();
    expect(mockSpan.setStatus).toHaveBeenCalledWith({ code: 1 });
  });

  it('sets ERROR status and records exception on failure', async () => {
    mockSpan.setStatus.mockClear();
    mockSpan.recordException.mockClear();

    class TestService {
      @Trace()
      async errorMethod(): Promise<void> {
        throw new Error('fail');
      }
    }

    const svc = new TestService();
    await expect(svc.errorMethod()).rejects.toThrow('fail');
    expect(mockSpan.setStatus).toHaveBeenCalledWith(
      expect.objectContaining({ code: 2 }),
    );
    expect(mockSpan.recordException).toHaveBeenCalled();
  });
});
