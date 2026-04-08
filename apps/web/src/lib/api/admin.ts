import { get } from './client';

/**
 * Lightweight admin helpers that aggregate from existing service endpoints.
 * No dedicated /api/admin backend service exists — all data comes from
 * existing microservice routes that are role-gated to ADMIN.
 */
export const adminApi = {
  /** Gateway health endpoint (public) */
  getGatewayHealth: () =>
    get<{ status: string; info?: Record<string, { status: string }> }>('/api/health'),
};
