/**
 * Lightweight Circuit Breaker — protects downstream services from cascading failures.
 *
 * States:
 *   CLOSED  → requests pass through normally
 *   OPEN    → requests fail immediately (fast-fail)
 *   HALF_OPEN → one probe request allowed to test recovery
 */

export enum CircuitState {
  CLOSED = 'CLOSED',
  OPEN = 'OPEN',
  HALF_OPEN = 'HALF_OPEN',
}

export interface CircuitBreakerOptions {
  /** Failures before opening the circuit (default: 5) */
  failureThreshold?: number;
  /** Time in ms before trying a probe request (default: 30_000) */
  resetTimeout?: number;
  /** Optional name for logging */
  name?: string;
}

export class CircuitBreaker {
  private state = CircuitState.CLOSED;
  private failureCount = 0;
  private lastFailureTime = 0;

  private readonly failureThreshold: number;
  private readonly resetTimeout: number;
  readonly name: string;

  constructor(opts: CircuitBreakerOptions = {}) {
    this.failureThreshold = opts.failureThreshold ?? 5;
    this.resetTimeout = opts.resetTimeout ?? 30_000;
    this.name = opts.name ?? 'default';
  }

  get currentState(): CircuitState {
    if (this.state === CircuitState.OPEN) {
      const elapsed = Date.now() - this.lastFailureTime;
      if (elapsed >= this.resetTimeout) {
        this.state = CircuitState.HALF_OPEN;
      }
    }
    return this.state;
  }

  /**
   * Execute a function through the circuit breaker.
   * Throws CircuitOpenError if the circuit is open.
   */
  async exec<T>(fn: () => Promise<T>): Promise<T> {
    const state = this.currentState;

    if (state === CircuitState.OPEN) {
      throw new CircuitOpenError(this.name);
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (err) {
      this.onFailure();
      throw err;
    }
  }

  private onSuccess(): void {
    this.failureCount = 0;
    this.state = CircuitState.CLOSED;
  }

  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    if (this.failureCount >= this.failureThreshold) {
      this.state = CircuitState.OPEN;
    }
  }

  /** Force-reset the circuit to CLOSED state */
  reset(): void {
    this.state = CircuitState.CLOSED;
    this.failureCount = 0;
  }
}

export class CircuitOpenError extends Error {
  constructor(name: string) {
    super(`Circuit breaker "${name}" is OPEN — downstream service unavailable`);
    this.name = 'CircuitOpenError';
  }
}
