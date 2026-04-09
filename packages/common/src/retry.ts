/**
 * Generic retry utility with exponential backoff + jitter.
 */

export interface RetryOptions {
  /** Max number of attempts (default: 3) */
  maxAttempts?: number;
  /** Base delay in ms (default: 200) */
  baseDelay?: number;
  /** Max delay cap in ms (default: 5000) */
  maxDelay?: number;
  /** Predicate — only retry if this returns true (default: always retry) */
  retryIf?: (error: unknown) => boolean;
}

/**
 * Execute `fn` with retry and exponential backoff + jitter.
 *
 * @example
 * const result = await withRetry(() => db.query('SELECT ...'), { maxAttempts: 3 });
 */
export async function withRetry<T>(fn: () => Promise<T>, opts: RetryOptions = {}): Promise<T> {
  const maxAttempts = opts.maxAttempts ?? 3;
  const baseDelay = opts.baseDelay ?? 200;
  const maxDelay = opts.maxDelay ?? 5000;
  const retryIf = opts.retryIf ?? (() => true);

  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt === maxAttempts || !retryIf(err)) {
        break;
      }
      // Exponential backoff with jitter: delay * 2^(attempt-1) + random(0..baseDelay)
      const delay = Math.min(baseDelay * Math.pow(2, attempt - 1), maxDelay);
      const jitter = Math.random() * baseDelay;
      await new Promise((r) => setTimeout(r, delay + jitter));
    }
  }

  throw lastError;
}
