'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  Search01Icon,
  FilterIcon,
  ArrowDown01Icon,
  ArrowUp01Icon,
  ArrowRight01Icon,
} from 'hugeicons-react';
import { adminVendorApplicationListQuery } from '@/lib/queries/auth/queries';
import type { VendorApplicationListQuery, VendorApplicationStatus } from '@/lib/api/types';

const STATUS_BADGE: Record<VendorApplicationStatus, { class: string; label: string }> = {
  PENDING: { class: 'badge badge-orange', label: 'Pending' },
  APPROVED: { class: 'badge badge-green', label: 'Approved' },
  REJECTED: { class: 'badge badge-red', label: 'Rejected' },
};

const STATUSES: VendorApplicationStatus[] = ['PENDING', 'APPROVED', 'REJECTED'];

type SortField = 'createdAt' | 'companyName';

export default function AdminVendorApplicationsPage() {
  const [query, setQuery] = useState<VendorApplicationListQuery>({
    page: 1,
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'DESC',
  });
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery(adminVendorApplicationListQuery({
    ...query,
    search: search || undefined,
  }));

  const apps = data?.data ?? [];
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

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Vendor Applications</h1>
        <p className="text-sm text-text-secondary mt-1">Review and manage seller applications</p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 w-full sm:max-w-sm">
          <Search01Icon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
          <input
            type="text"
            placeholder="Search by name or company..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setQuery((q) => ({ ...q, page: 1 }));
            }}
            className="input h-9 w-full pl-9 text-xs rounded-md"
          />
        </div>

        <div className="flex items-center gap-2">
          <FilterIcon size={16} className="text-text-muted" />
          <select
            value={query.status ?? ''}
            onChange={(e) =>
              setQuery((q) => ({
                ...q,
                page: 1,
                status: (e.target.value || undefined) as VendorApplicationStatus | undefined,
              }))
            }
            className="input h-9 text-xs rounded-md w-36"
          >
            <option value="">All Statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{STATUS_BADGE[s].label}</option>
            ))}
          </select>
        </div>

        {meta && (
          <p className="text-xs text-text-muted ml-auto">
            {meta.total} application{meta.total !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* Table */}
      <div className="bg-surface rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-neutral-50">
              <th className="text-left px-5 py-3">
                <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">Applicant</span>
              </th>
              <th className="text-left px-5 py-3">
                <button onClick={() => toggleSort('companyName')} className="flex items-center gap-1 text-xs font-semibold text-text-muted uppercase tracking-wider hover:text-text-primary transition-colors">
                  Company <SortIcon field="companyName" />
                </button>
              </th>
              <th className="text-left px-5 py-3">
                <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">City</span>
              </th>
              <th className="text-left px-5 py-3">
                <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">Status</span>
              </th>
              <th className="text-left px-5 py-3">
                <button onClick={() => toggleSort('createdAt')} className="flex items-center gap-1 text-xs font-semibold text-text-muted uppercase tracking-wider hover:text-text-primary transition-colors">
                  Date <SortIcon field="createdAt" />
                </button>
              </th>
              <th className="w-28 px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-border-light">
                  <td className="px-5 py-3"><div className="skeleton h-5 w-32" /></td>
                  <td className="px-5 py-3"><div className="skeleton h-5 w-40" /></td>
                  <td className="px-5 py-3"><div className="skeleton h-5 w-20" /></td>
                  <td className="px-5 py-3"><div className="skeleton h-5 w-20" /></td>
                  <td className="px-5 py-3"><div className="skeleton h-5 w-24" /></td>
                  <td className="px-5 py-3" />
                </tr>
              ))
            ) : apps.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-16 text-center text-sm text-text-muted">
                  No applications found
                </td>
              </tr>
            ) : (
              apps.map((app) => {
                const statusMeta = STATUS_BADGE[app.status];
                return (
                  <tr key={app.id} className="border-b border-border-light last:border-b-0 hover:bg-neutral-50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xs font-bold shrink-0">
                          {app.firstName.charAt(0)}{app.lastName.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-text-primary truncate">{app.firstName} {app.lastName}</p>
                          <p className="text-xs text-text-muted truncate">{app.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <p className="text-sm text-text-primary truncate">{app.companyName}</p>
                      <p className="text-xs text-text-muted">{app.companyType}</p>
                    </td>
                    <td className="px-5 py-3 text-text-secondary text-xs">
                      {app.city}
                    </td>
                    <td className="px-5 py-3">
                      <span className={statusMeta.class}>{statusMeta.label}</span>
                    </td>
                    <td className="px-5 py-3 text-text-muted text-xs">
                      {new Date(app.createdAt).toLocaleDateString('tr-TR', {
                        year: 'numeric', month: 'short', day: 'numeric',
                      })}
                    </td>
                    <td className="px-5 py-3">
                      <Link
                        href={`/admin/applications/${app.id}`}
                        className="btn btn-sm btn-secondary flex items-center gap-1"
                      >
                        Review
                        <ArrowRight01Icon size={14} />
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

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
