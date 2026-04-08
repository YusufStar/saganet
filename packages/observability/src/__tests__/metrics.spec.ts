import { Registry } from 'prom-client';

describe('MetricsRegistry', () => {
  it('creates a Prometheus registry without throwing', () => {
    const registry = new Registry();
    expect(registry).toBeDefined();
  });

  it('can collect default metrics into isolated registry', () => {
    const { collectDefaultMetrics, Registry: Reg } = require('prom-client') as typeof import('prom-client');
    const registry = new Reg();
    expect(() => collectDefaultMetrics({ register: registry })).not.toThrow();
  });
});
