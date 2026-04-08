import { queryOptions } from '@tanstack/react-query';
import { ordersApi } from '@/lib/api/orders';
import type { OrderListQuery } from '@/lib/api/types';
import { orderKeys } from './query-keys';

export const orderListQuery = (query?: OrderListQuery) =>
  queryOptions({
    queryKey: orderKeys.list(query),
    queryFn: () => ordersApi.list(query),
  });

export const orderDetailQuery = (id: string) =>
  queryOptions({
    queryKey: orderKeys.detail(id),
    queryFn: () => ordersApi.get(id),
    enabled: !!id,
  });

export const adminOrderListQuery = (query?: OrderListQuery) =>
  queryOptions({
    queryKey: orderKeys.adminList(query),
    queryFn: () => ordersApi.admin.listAll(query),
  });
