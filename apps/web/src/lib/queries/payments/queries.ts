import { queryOptions } from '@tanstack/react-query';
import { paymentsApi } from '@/lib/api/payments';
import { paymentKeys } from './query-keys';

export const paymentListQuery = (query?: { page?: number; limit?: number }) =>
  queryOptions({
    queryKey: paymentKeys.list(query),
    queryFn: () => paymentsApi.list(query),
  });

export const paymentByOrderQuery = (orderId: string) =>
  queryOptions({
    queryKey: paymentKeys.byOrder(orderId),
    queryFn: () => paymentsApi.getByOrder(orderId),
    enabled: !!orderId,
  });
