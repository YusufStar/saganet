import { get, qs } from './client';
import type { Payment, PaginatedResponse } from './types';

const PAYMENTS = '/api/payments';

export const paymentsApi = {
  getByOrder: (orderId: string) =>
    get<Payment>(`${PAYMENTS}/${orderId}`),

  list: (query?: { page?: number; limit?: number }) =>
    get<PaginatedResponse<Payment>>(`${PAYMENTS}${qs(query as Record<string, unknown>)}`),
};
