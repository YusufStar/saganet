import { get, post, qs } from './client';
import type {
  Payment, PaginatedResponse,
  AdminPaymentListQuery, RefundPaymentRequest,
} from './types';

const PAYMENTS = '/api/payments';

export const paymentsApi = {
  getByOrder: (orderId: string) =>
    get<Payment>(`${PAYMENTS}/${orderId}`),

  list: (query?: { page?: number; limit?: number }) =>
    get<PaginatedResponse<Payment>>(`${PAYMENTS}${qs(query as Record<string, unknown>)}`),

  // ─── Admin ────────────────────────────────────────────────────────────────
  // Backend GET /payments is already @Roles(ADMIN) only.

  admin: {
    listAll: (query?: AdminPaymentListQuery) =>
      get<PaginatedResponse<Payment>>(`${PAYMENTS}${qs(query as Record<string, unknown>)}`),

    refund: (id: string, body?: RefundPaymentRequest) =>
      post<Payment>(`${PAYMENTS}/${id}/refund`, body),
  },
};
