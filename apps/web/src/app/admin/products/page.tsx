'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Search01Icon,
  FilterIcon,
  ArrowDown01Icon,
  ArrowUp01Icon,
  MoreHorizontalIcon,
  CheckmarkCircle01Icon,
  Cancel01Icon,
  ViewIcon,
  Image01Icon,
} from 'hugeicons-react';
import { adminProductListQuery, categoriesQuery } from '@/lib/queries/catalog/queries';
import { useApproveProduct, useRejectProduct } from '@/lib/queries/catalog/mutations';
import type { AdminProductListQuery, ProductStatus } from '@/lib/api/types';
import { Popover } from '@/components/ui/Popover';

const STATUS_BADGE: Record<ProductStatus, { class: string; label: string }> = {
  PENDING_REVIEW: { class: 'badge badge-orange', label: 'Pending' },
  ACTIVE: { class: 'badge badge-green', label: 'Active' },
  REJECTED: { class: 'badge badge-red', label: 'Rejected' },
  SUSPENDED: { class: 'badge badge-gray', label: 'Suspended' },
};

const STATUSES: ProductStatus[] = ['PENDING_REVIEW', 'ACTIVE', 'REJECTED', 'SUSPENDED'];

type SortField = 'name' | 'price' | 'createdAt';

export default function AdminProductsPage() {
  const [query, setQuery] = useState<AdminProductListQuery>({
    page: 1,
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'DESC',
  });
  const [search, setSearch] = useState('');
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [rejectTarget, setRejectTarget] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const { data, isLoading } = useQuery(adminProductListQuery({
    ...query,
    search: search || undefined,
  }));
  const { data: categories } = useQuery(categoriesQuery());

  const approveProduct = useApproveProduct();
  const rejectProduct = useRejectProduct();

  const products = data?.data ?? [];
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

  const handleApprove = (id: string) => {
    approveProduct.mutate(id);
    setActiveMenu(null);
  };

  const handleRejectSubmit = () => {
    if (!rejectTarget) return;
    rejectProduct.mutate({ id: rejectTarget, reason: rejectReason || undefined });
    setRejectTarget(null);
    setRejectReason('');
  };

  const getCategoryName = (categoryId: string): string => {
    if (!categories) return '—';
    const find = (cats: typeof categories): string | null => {
      for (const c of cats) {
        if (c.id === categoryId) return c.name;
        if (c.children?.length) {
          const found = find(c.children);
          if (found) return found;
        }
      }
      return null;
    };
    return find(categories) ?? '—';
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Products</h1>
        <p className="text-sm text-text-secondary mt-1">Review and manage all platform products</p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 w-full sm:max-w-sm">
          <Search01Icon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
          <input
            type="text"
            placeholder="Search by product name..."
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
                status: (e.target.value || undefined) as ProductStatus | undefined,
              }))
            }
            className="input h-9 text-xs rounded-md w-40"
          >
            <option value="">All Statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{STATUS_BADGE[s].label}</option>
            ))}
          </select>
        </div>

        {meta && (
          <p className="text-xs text-text-muted ml-auto">
            {meta.total} product{meta.total !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* Table */}
      <div className="bg-surface rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-neutral-50">
              <th className="text-left px-5 py-3">
                <button onClick={() => toggleSort('name')} className="flex items-center gap-1 text-xs font-semibold text-text-muted uppercase tracking-wider hover:text-text-primary transition-colors">
                  Product <SortIcon field="name" />
                </button>
              </th>
              <th className="text-left px-5 py-3">
                <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">Category</span>
              </th>
              <th className="text-left px-5 py-3">
                <button onClick={() => toggleSort('price')} className="flex items-center gap-1 text-xs font-semibold text-text-muted uppercase tracking-wider hover:text-text-primary transition-colors">
                  Price <SortIcon field="price" />
                </button>
              </th>
              <th className="text-left px-5 py-3">
                <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">Status</span>
              </th>
              <th className="text-left px-5 py-3">
                <button onClick={() => toggleSort('createdAt')} className="flex items-center gap-1 text-xs font-semibold text-text-muted uppercase tracking-wider hover:text-text-primary transition-colors">
                  Created <SortIcon field="createdAt" />
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
                  <td className="px-5 py-3"><div className="skeleton h-5 w-24" /></td>
                  <td className="px-5 py-3"><div className="skeleton h-5 w-20" /></td>
                  <td className="px-5 py-3"><div className="skeleton h-5 w-20" /></td>
                  <td className="px-5 py-3"><div className="skeleton h-5 w-24" /></td>
                  <td className="px-5 py-3" />
                </tr>
              ))
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-16 text-center text-sm text-text-muted">
                  No products found
                </td>
              </tr>
            ) : (
              products.map((product) => {
                const status = (product as unknown as { status: ProductStatus }).status;
                const statusMeta = STATUS_BADGE[status] ?? STATUS_BADGE.ACTIVE;
                return (
                  <tr key={product.id} className="border-b border-border-light last:border-b-0 hover:bg-neutral-50 transition-colors">
                    {/* Product */}
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-md bg-neutral-100 flex items-center justify-center shrink-0 overflow-hidden">
                          {product.images?.[0] ? (
                            <img src={product.images[0].url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <Image01Icon size={18} className="text-text-disabled" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-text-primary truncate">{product.name}</p>
                          <p className="text-xs text-text-muted truncate">ID: {product.id.slice(0, 8)}</p>
                        </div>
                      </div>
                    </td>
                    {/* Category */}
                    <td className="px-5 py-3 text-text-secondary text-xs">
                      {getCategoryName(product.categoryId)}
                    </td>
                    {/* Price */}
                    <td className="px-5 py-3 font-medium text-text-primary">
                      ₺{Number(product.price).toLocaleString()}
                    </td>
                    {/* Status */}
                    <td className="px-5 py-3">
                      <span className={statusMeta.class}>{statusMeta.label}</span>
                    </td>
                    {/* Created */}
                    <td className="px-5 py-3 text-text-muted text-xs">
                      {new Date(product.createdAt).toLocaleDateString('tr-TR', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    {/* Actions */}
                    <td className="px-5 py-3">
                      <div className="relative" onMouseLeave={() => setActiveMenu(null)}>
                        <button
                          onClick={() => setActiveMenu(activeMenu === product.id ? null : product.id)}
                          className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-neutral-100 transition-colors"
                        >
                          <MoreHorizontalIcon size={18} className="text-text-secondary" />
                        </button>

                        <Popover open={activeMenu === product.id} align="right" minWidth={180}>
                          <div className="py-1">
                            {status === 'PENDING_REVIEW' && (
                              <>
                                <button
                                  onClick={() => handleApprove(product.id)}
                                  disabled={approveProduct.isPending}
                                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-success hover:bg-success-bg transition-colors disabled:opacity-50"
                                >
                                  <CheckmarkCircle01Icon size={16} />
                                  Approve
                                </button>
                                <button
                                  onClick={() => {
                                    setRejectTarget(product.id);
                                    setActiveMenu(null);
                                  }}
                                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-error hover:bg-error-bg transition-colors"
                                >
                                  <Cancel01Icon size={16} />
                                  Reject
                                </button>
                              </>
                            )}
                            {status === 'ACTIVE' && (
                              <button
                                onClick={() => {
                                  setRejectTarget(product.id);
                                  setActiveMenu(null);
                                }}
                                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-error hover:bg-error-bg transition-colors"
                              >
                                <Cancel01Icon size={16} />
                                Suspend
                              </button>
                            )}
                            {(status === 'REJECTED' || status === 'SUSPENDED') && (
                              <button
                                onClick={() => handleApprove(product.id)}
                                disabled={approveProduct.isPending}
                                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-success hover:bg-success-bg transition-colors disabled:opacity-50"
                              >
                                <CheckmarkCircle01Icon size={16} />
                                Re-activate
                              </button>
                            )}
                            <div className="divider my-1" />
                            <button
                              onClick={() => {
                                window.open(`/product/${product.slug}`, '_blank');
                                setActiveMenu(null);
                              }}
                              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-text-primary hover:bg-neutral-50 transition-colors"
                            >
                              <ViewIcon size={16} />
                              View Product
                            </button>
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

      {/* Reject Modal */}
      {rejectTarget && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setRejectTarget(null)} />
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md p-6 mx-4">
            <h3 className="text-lg font-semibold text-text-primary mb-1">Reject Product</h3>
            <p className="text-sm text-text-secondary mb-4">Optionally provide a reason for rejection.</p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Reason for rejection..."
              className="input w-full h-24 text-sm rounded-md resize-none"
            />
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => {
                  setRejectTarget(null);
                  setRejectReason('');
                }}
                className="btn btn-sm btn-ghost"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectSubmit}
                disabled={rejectProduct.isPending}
                className="btn btn-sm bg-error text-white hover:bg-red-600 disabled:opacity-50"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
