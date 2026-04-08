import { queryOptions } from '@tanstack/react-query';
import { authApi } from '@/lib/api/auth';
import { authKeys } from './query-keys';

export const profileQuery = () =>
  queryOptions({
    queryKey: authKeys.profile(),
    queryFn: () => authApi.getProfile(),
  });

export const addressesQuery = () =>
  queryOptions({
    queryKey: authKeys.addresses(),
    queryFn: () => authApi.listAddresses(),
  });
