'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Search01Icon,
  FilterIcon,
  ArrowDown01Icon,
  ArrowUp01Icon,
  MoreHorizontalIcon,
  ShieldUserIcon,
  UserAccountIcon,
  Store01Icon,
  Cancel01Icon,
  CheckmarkCircle01Icon,
} from 'hugeicons-react';
import { adminUserListQuery } from '@/lib/queries/auth/queries';
import {
  useUpdateUserRole,
  useBanUser,
  useUnbanUser,
} from '@/lib/queries/auth/mutations';
import type { AdminUserListQuery, UserRole } from '@/lib/api/types';
import { Popover } from '@/components/ui/Popover';

const ROLE_BADGE: Record<UserRole, { class: string; label: string }> = {
  ADMIN: { class: 'badge badge-red', label: 'Admin' },
  VENDOR: { class: 'badge badge-orange', label: 'Vendor' },
  CUSTOMER: { class: 'badge badge-blue', label: 'Customer' },
};

const ROLES: UserRole[] = ['ADMIN', 'VENDOR', 'CUSTOMER'];

type SortField = 'email' | 'createdAt' | 'role';

export default function AdminUsersPage() {
  const [query, setQuery] = useState<AdminUserListQuery>({
    page: 1,
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'DESC',
  });
  const [search, setSearch] = useState('');
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const { data, isLoading } = useQuery(adminUserListQuery({
    ...query,
    search: search || undefined,
  }));

  const updateRole = useUpdateUserRole();
  const banUser = useBanUser();
  const unbanUser = useUnbanUser();

  const users = data?.data ?? [];
  const meta = data?.meta;

  const toggleSort = (field: SortField) => {
    setQuery((q) => ({
      ...q,
      page: 1,
      sortBy: field,
      sortOrder: q.sortBy === field && q.sortOrder === 'ASC' ? 'DESC' : 'ASC',
    }));
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (query.sortBy !== field) return null;
    return query.sortOrder === 'ASC'
      ? <ArrowUp01Icon size={14} className="text-orange-500" />
      : <ArrowDown01Icon size={14} className="text-orange-500" />;
  };

  const handleRoleChange = (userId: string, role: UserRole) => {
    updateRole.mutate({ id: userId, body: { role } });
    setActiveMenu(null);
  };

  const handleBan = (userId: string) => {
    banUser.mutate({ id: userId });
    setActiveMenu(null);
  };

  const handleUnban = (userId: string) => {
    unbanUser.mutate(userId);
    setActiveMenu(null);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Users</h1>
        <p className="text-sm text-text-secondary mt-1">Manage all platform users</p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 w-full sm:max-w-sm">
          <Search01Icon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
          <input
            type="text"
            placeholder="Search by email or name..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setQuery((q) => ({ ...q, page: 1 }));
            }}
            className="input h-9 w-full pl-9 text-xs rounded-md"
          />
        </div>

        {/* Role filter */}
        <div className="flex items-center gap-2">
          <FilterIcon size={16} className="text-text-muted" />
          <select
            value={query.role ?? ''}
            onChange={(e) =>
              setQuery((q) => ({
                ...q,
                page: 1,
                role: (e.target.value || undefined) as UserRole | undefined,
              }))
            }
            className="input h-9 text-xs rounded-md w-36"
          >
            <option value="">All Roles</option>
            {ROLES.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        {/* Count */}
        {meta && (
          <p className="text-xs text-text-muted ml-auto">
            {meta.total} user{meta.total !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* Table */}
      <div className="bg-surface rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-neutral-50">
              <th className="text-left px-5 py-3">
                <button onClick={() => toggleSort('email')} className="flex items-center gap-1 text-xs font-semibold text-text-muted uppercase tracking-wider hover:text-text-primary transition-colors">
                  User <SortIcon field="email" />
                </button>
              </th>
              <th className="text-left px-5 py-3">
                <button onClick={() => toggleSort('role')} className="flex items-center gap-1 text-xs font-semibold text-text-muted uppercase tracking-wider hover:text-text-primary transition-colors">
                  Role <SortIcon field="role" />
                </button>
              </th>
              <th className="text-left px-5 py-3">
                <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">Status</span>
              </th>
              <th className="text-left px-5 py-3">
                <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">Verified</span>
              </th>
              <th className="text-left px-5 py-3">
                <button onClick={() => toggleSort('createdAt')} className="flex items-center gap-1 text-xs font-semibold text-text-muted uppercase tracking-wider hover:text-text-primary transition-colors">
                  Joined <SortIcon field="createdAt" />
                </button>
              </th>
              <th className="w-12 px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-border-light">
                  <td className="px-5 py-3"><div className="skeleton h-5 w-48" /></td>
                  <td className="px-5 py-3"><div className="skeleton h-5 w-20" /></td>
                  <td className="px-5 py-3"><div className="skeleton h-5 w-16" /></td>
                  <td className="px-5 py-3"><div className="skeleton h-5 w-16" /></td>
                  <td className="px-5 py-3"><div className="skeleton h-5 w-24" /></td>
                  <td className="px-5 py-3" />
                </tr>
              ))
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-16 text-center text-sm text-text-muted">
                  No users found
                </td>
              </tr>
            ) : (
              users.map((user) => {
                const roleMeta = ROLE_BADGE[user.role];
                return (
                  <tr key={user.id} className="border-b border-border-light last:border-b-0 hover:bg-neutral-50 transition-colors">
                    {/* User */}
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xs font-bold shrink-0">
                          {(user.displayName ?? user.email).charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          {user.displayName && (
                            <p className="text-sm font-medium text-text-primary truncate">{user.displayName}</p>
                          )}
                          <p className="text-xs text-text-muted truncate">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    {/* Role */}
                    <td className="px-5 py-3">
                      <span className={roleMeta.class}>{roleMeta.label}</span>
                    </td>
                    {/* Ban status */}
                    <td className="px-5 py-3">
                      {user.isBanned ? (
                        <span className="badge badge-red">Banned</span>
                      ) : (
                        <span className="badge badge-green">Active</span>
                      )}
                    </td>
                    {/* Email verified */}
                    <td className="px-5 py-3">
                      {user.emailVerified ? (
                        <CheckmarkCircle01Icon size={18} className="text-success" />
                      ) : (
                        <Cancel01Icon size={18} className="text-text-disabled" />
                      )}
                    </td>
                    {/* Joined */}
                    <td className="px-5 py-3 text-text-muted text-xs">
                      {new Date(user.createdAt).toLocaleDateString('tr-TR', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    {/* Actions */}
                    <td className="px-5 py-3">
                      <div
                        className="relative"
                        onMouseLeave={() => setActiveMenu(null)}
                      >
                        <button
                          onClick={() => setActiveMenu(activeMenu === user.id ? null : user.id)}
                          className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-neutral-100 transition-colors"
                        >
                          <MoreHorizontalIcon size={18} className="text-text-secondary" />
                        </button>

                        <Popover open={activeMenu === user.id} align="right" minWidth={180}>
                          <div className="py-1">
                            {/* Role change section */}
                            <p className="px-3 py-1.5 text-[10px] font-semibold text-text-muted uppercase tracking-wider">
                              Change Role
                            </p>
                            {ROLES.filter((r) => r !== user.role).map((role) => {
                              const Icon = role === 'ADMIN' ? ShieldUserIcon : role === 'VENDOR' ? Store01Icon : UserAccountIcon;
                              return (
                                <button
                                  key={role}
                                  onClick={() => handleRoleChange(user.id, role)}
                                  disabled={updateRole.isPending}
                                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-text-primary hover:bg-neutral-50 transition-colors disabled:opacity-50"
                                >
                                  <Icon size={16} />
                                  Set as {role.charAt(0) + role.slice(1).toLowerCase()}
                                </button>
                              );
                            })}

                            <div className="divider my-1" />

                            {/* Ban / Unban */}
                            {user.isBanned ? (
                              <button
                                onClick={() => handleUnban(user.id)}
                                disabled={unbanUser.isPending}
                                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-success hover:bg-success-bg transition-colors disabled:opacity-50"
                              >
                                <CheckmarkCircle01Icon size={16} />
                                Unban User
                              </button>
                            ) : (
                              <button
                                onClick={() => handleBan(user.id)}
                                disabled={banUser.isPending}
                                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-error hover:bg-error-bg transition-colors disabled:opacity-50"
                              >
                                <Cancel01Icon size={16} />
                                Ban User
                              </button>
                            )}
                          </div>
                        </Popover>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-border bg-neutral-50">
            <p className="text-xs text-text-muted">
              Page {meta.page} of {meta.totalPages}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setQuery((q) => ({ ...q, page: (q.page ?? 1) - 1 }))}
                disabled={meta.page <= 1}
                className="btn btn-sm btn-ghost disabled:opacity-40"
              >
                Previous
              </button>
              <button
                onClick={() => setQuery((q) => ({ ...q, page: (q.page ?? 1) + 1 }))}
                disabled={meta.page >= meta.totalPages}
                className="btn btn-sm btn-ghost disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
