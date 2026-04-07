export interface ServiceRoute {
  /** Path prefix that triggers this route (e.g. '/api/auth') */
  prefix: string;
  /** Target service URL (read from env) */
  target: string;
}

/**
 * Returns the proxy route table from environment variables.
 * Defaults fall back to localhost ports for local development.
 */
export function getRoutes(): ServiceRoute[] {
  return [
    { prefix: '/api/auth',         target: process.env.AUTH_SERVICE_URL         ?? 'http://localhost:3001' },
    { prefix: '/api/catalog',      target: process.env.CATALOG_SERVICE_URL      ?? 'http://localhost:3002' },
    { prefix: '/api/inventory',    target: process.env.INVENTORY_SERVICE_URL    ?? 'http://localhost:3003' },
    { prefix: '/api/orders',       target: process.env.ORDER_SERVICE_URL        ?? 'http://localhost:3004' },
    { prefix: '/api/payments',     target: process.env.PAYMENT_SERVICE_URL      ?? 'http://localhost:3005' },
    { prefix: '/api/notifications',target: process.env.NOTIFICATION_SERVICE_URL ?? 'http://localhost:3006' },
  ];
}
