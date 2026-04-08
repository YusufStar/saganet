import { queryOptions } from '@tanstack/react-query';
import { adminApi } from '@/lib/api/admin';
import { adminKeys } from './query-keys';

export const gatewayHealthQuery = () =>
  queryOptions({
    queryKey: adminKeys.gatewayHealth(),
    queryFn: () => adminApi.getGatewayHealth(),
    refetchInterval: 30_000,
  });
