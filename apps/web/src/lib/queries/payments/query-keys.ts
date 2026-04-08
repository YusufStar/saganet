import type { AdminPaymentListQuery } from '@/lib/api/types';

export const paymentKeys = {
  all: ['payments'] as const,
  list: (query?: { page?: number; limit?: number }) => [...paymentKeys.all, 'list', query ?? {}] as const,
  byOrder: (orderId: string) => [...paymentKeys.all, 'order', orderId] as const,

  // Admin
  adminList: (query?: AdminPaymentListQuery) => [...paymentKeys.all, 'admin', 'list', query ?? {}] as const,
};
