import { queryOptions } from '@tanstack/react-query';
import { authApi } from '@/lib/api/auth';
import type { AdminUserListQuery } from '@/lib/api/types';
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

// ─── Admin ───────────────────────────────────────────────────────────────────

export const adminUserListQuery = (query?: AdminUserListQuery) =>
  queryOptions({
    queryKey: authKeys.adminUsers(query),
    queryFn: () => authApi.admin.listUsers(query),
  });

export const adminUserDetailQuery = (id: string) =>
  queryOptions({
    queryKey: authKeys.adminUser(id),
    queryFn: () => authApi.admin.getUser(id),
    enabled: !!id,
  });
