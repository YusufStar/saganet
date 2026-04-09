import { queryOptions } from '@tanstack/react-query';
import { authApi } from '@/lib/api/auth';
import type { AdminUserListQuery, VendorApplicationListQuery } from '@/lib/api/types';
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

// ─── Vendor Application ─────────────────────────────────────────────────────

export const vendorApplicationQuery = () =>
  queryOptions({
    queryKey: authKeys.vendorApplication(),
    queryFn: () => authApi.vendorApplication.getOwn(),
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

export const adminVendorApplicationListQuery = (query?: VendorApplicationListQuery) =>
  queryOptions({
    queryKey: authKeys.adminVendorApplications(query),
    queryFn: () => authApi.admin.listVendorApplications(query),
  });

export const adminVendorApplicationDetailQuery = (id: string) =>
  queryOptions({
    queryKey: authKeys.adminVendorApplication(id),
    queryFn: () => authApi.admin.getVendorApplication(id),
    enabled: !!id,
  });
