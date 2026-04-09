import type { AdminUserListQuery, VendorApplicationListQuery } from '@/lib/api/types';

export const authKeys = {
  all: ['auth'] as const,
  profile: () => [...authKeys.all, 'profile'] as const,
  addresses: () => [...authKeys.all, 'addresses'] as const,
  address: (id: string) => [...authKeys.addresses(), id] as const,

  // Vendor Application
  vendorApplication: () => [...authKeys.all, 'vendor-application'] as const,

  // Admin
  adminUsers: (query?: AdminUserListQuery) => [...authKeys.all, 'admin', 'users', query ?? {}] as const,
  adminUser: (id: string) => [...authKeys.all, 'admin', 'users', id] as const,
  adminVendorApplications: (query?: VendorApplicationListQuery) => [...authKeys.all, 'admin', 'vendor-applications', query ?? {}] as const,
  adminVendorApplication: (id: string) => [...authKeys.all, 'admin', 'vendor-applications', id] as const,
};
