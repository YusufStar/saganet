import { CircuitBreaker } from '@saganet/common';
import { getRoutes } from './route.config';

/**
 * One circuit breaker per upstream service.
 * Keyed by route prefix (e.g. '/api/auth').
 */
const breakers = new Map<string, CircuitBreaker>();

for (const route of getRoutes()) {
  breakers.set(
    route.prefix,
    new CircuitBreaker({
      name: route.prefix.replace('/api/', ''),
      failureThreshold: 5,
      resetTimeout: 30_000,
    }),
  );
}

export function getBreaker(prefix: string): CircuitBreaker | undefined {
  return breakers.get(prefix);
}

export function getAllBreakers(): Map<string, CircuitBreaker> {
  return breakers;
}
