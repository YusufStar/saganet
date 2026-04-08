import type { OrderListQuery } from '@/lib/api/types';

export const orderKeys = {
  all: ['orders'] as const,
  list: (query?: OrderListQuery) => [...orderKeys.all, 'list', query ?? {}] as const,
  detail: (id: string) => [...orderKeys.all, id] as const,
  adminList: (query?: OrderListQuery) => [...orderKeys.all, 'admin', 'list', query ?? {}] as const,
};
