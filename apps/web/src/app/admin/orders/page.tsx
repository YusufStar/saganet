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
  DeliveryTruck01Icon,
  ViewIcon,
} from 'hugeicons-react';
import { adminOrderListQuery } from '@/lib/queries/orders/queries';
import { useAdminUpdateOrderStatus } from '@/lib/queries/orders/mutations';
import type { AdminOrderListQuery, OrderStatus } from '@/lib/api/types';
import { Popover } from '@/components/ui/Popover';

const STATUS_BADGE: Record<OrderStatus, { class: string; label: string }> = {
  PENDING: { class: 'badge badge-orange', label: 'Pending' },
  CONFIRMED: { class: 'badge badge-blue', label: 'Confirmed' },
  COMPLETED: { class: 'badge badge-green', label: 'Completed' },
  FAILED: { class: 'badge badge-red', label: 'Failed' },
  CANCELLED: { class: 'badge badge-gray', label: 'Cancelled' },
};

const STATUSES: OrderStatus[] = ['PENDING', 'CONFIRMED', 'COMPLETED', 'FAILED', 'CANCELLED'];

const STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['COMPLETED', 'CANCELLED'],
  COMPLETED: [],
  FAILED: [],
  CANCELLED: [],
};

const STATUS_ICON: Record<OrderStatus, React.ElementType> = {
  PENDING: DeliveryTruck01Icon,
  CONFIRMED: CheckmarkCircle01Icon,
  COMPLETED: CheckmarkCircle01Icon,
  FAILED: Cancel01Icon,
  CANCELLED: Cancel01Icon,
};

type SortField = 'createdAt' | 'totalAmount' | 'status';

export default function AdminOrdersPage() {
  const [query, setQuery] = useState<AdminOrderListQuery>({
    page: 1,
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'DESC',
  });
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [detailOrder, setDetailOrder] = useState<string | null>(null);

  const { data, isLoading } = useQuery(adminOrderListQuery(query));
  const updateStatus = useAdminUpdateOrderStatus();

  const orders = data?.data ?? [];
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

  const handleStatusChange = (orderId: string, status: OrderStatus) => {
    updateStatus.mutate({ id: orderId, body: { status } });
    setActiveMenu(null);
  };

  // Find order for detail modal
  const selectedOrder = detailOrder ? orders.find((o) => o.id === detailOrder) : null;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Orders</h1>
        <p className="text-sm text-text-secondary mt-1">Manage and track all platform orders</p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="flex items-center gap-2">
          <FilterIcon size={16} className="text-text-muted" />
          <select
            value={query.status ?? ''}
            onChange={(e) =>
              setQuery((q) => ({
                ...q,
                page: 1,
                status: (e.target.value || undefined) as OrderStatus | undefined,
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
            {meta.total} order{meta.total !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* Table */}
      <div className="bg-surface rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-neutral-50">
              <th className="text-left px-5 py-3">
                <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">Order ID</span>
              </th>
              <th className="text-left px-5 py-3">
                <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">Customer</span>
              </th>
              <th className="text-left px-5 py-3">
                <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">Items</span>
              </th>
              <th className="text-left px-5 py-3">
                <button onClick={() => toggleSort('totalAmount')} className="flex items-center gap-1 text-xs font-semibold text-text-muted uppercase tracking-wider hover:text-text-primary transition-colors">
                  Amount <SortIcon field="totalAmount" />
                </button>
              </th>
              <th className="text-left px-5 py-3">
                <button onClick={() => toggleSort('status')} className="flex items-center gap-1 text-xs font-semibold text-text-muted uppercase tracking-wider hover:text-text-primary transition-colors">
                  Status <SortIcon field="status" />
                </button>
              </th>
              <th className="text-left px-5 py-3">
                <button onClick={() => toggleSort('createdAt')} className="flex items-center gap-1 text-xs font-semibold text-text-muted uppercase tracking-wider hover:text-text-primary transition-colors">
                  Date <SortIcon field="createdAt" />
                </button>
              </th>
              <th className="w-12 px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-border-light">
                  <td className="px-5 py-3"><div className="skeleton h-5 w-20" /></td>
                  <td className="px-5 py-3"><div className="skeleton h-5 w-32" /></td>
                  <td className="px-5 py-3"><div className="skeleton h-5 w-10" /></td>
                  <td className="px-5 py-3"><div className="skeleton h-5 w-20" /></td>
                  <td className="px-5 py-3"><div className="skeleton h-5 w-20" /></td>
                  <td className="px-5 py-3"><div className="skeleton h-5 w-24" /></td>
                  <td className="px-5 py-3" />
                </tr>
              ))
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-16 text-center text-sm text-text-muted">
                  No orders found
                </td>
              </tr>
            ) : (
              orders.map((order) => {
                const statusMeta = STATUS_BADGE[order.status];
                const transitions = STATUS_TRANSITIONS[order.status];
                return (
                  <tr key={order.id} className="border-b border-border-light last:border-b-0 hover:bg-neutral-50 transition-colors">
                    {/* Order ID */}
                    <td className="px-5 py-3">
                      <span className="font-medium text-text-primary">#{order.id.slice(0, 8)}</span>
                    </td>
                    {/* Customer */}
                    <td className="px-5 py-3">
                      <div className="min-w-0">
                        <p className="text-sm text-text-primary truncate">{order.addressSnapshot?.fullName ?? '—'}</p>
                        <p className="text-xs text-text-muted truncate">{order.addressSnapshot?.city}</p>
                      </div>
                    </td>
                    {/* Items */}
                    <td className="px-5 py-3 text-text-secondary text-xs">
                      {order.items?.length ?? 0} item{(order.items?.length ?? 0) !== 1 ? 's' : ''}
                    </td>
                    {/* Amount */}
                    <td className="px-5 py-3 font-medium text-text-primary">
                      ₺{Number(order.totalAmount).toLocaleString()}
                    </td>
                    {/* Status */}
                    <td className="px-5 py-3">
                      <span className={statusMeta.class}>{statusMeta.label}</span>
                    </td>
                    {/* Date */}
                    <td className="px-5 py-3 text-text-muted text-xs">
                      {new Date(order.createdAt).toLocaleDateString('tr-TR', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    {/* Actions */}
                    <td className="px-5 py-3">
                      <div className="relative" onMouseLeave={() => setActiveMenu(null)}>
                        <button
                          onClick={() => setActiveMenu(activeMenu === order.id ? null : order.id)}
                          className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-neutral-100 transition-colors"
                        >
                          <MoreHorizontalIcon size={18} className="text-text-secondary" />
                        </button>

                        <Popover open={activeMenu === order.id} align="right" minWidth={180}>
                          <div className="py-1">
                            {transitions.length > 0 && (
                              <>
                                <p className="px-3 py-1.5 text-[10px] font-semibold text-text-muted uppercase tracking-wider">
                                  Update Status
                                </p>
                                {transitions.map((status) => {
                                  const Icon = STATUS_ICON[status];
                                  const isNegative = status === 'CANCELLED' || status === 'FAILED';
                                  return (
                                    <button
                                      key={status}
                                      onClick={() => handleStatusChange(order.id, status)}
                                      disabled={updateStatus.isPending}
                                      className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors disabled:opacity-50 ${
                                        isNegative
                                          ? 'text-error hover:bg-error-bg'
                                          : 'text-text-primary hover:bg-neutral-50'
                                      }`}
                                    >
                                      <Icon size={16} />
                                      {STATUS_BADGE[status].label}
                                    </button>
                                  );
                                })}
                                <div className="divider my-1" />
                              </>
                            )}
                            <button
                              onClick={() => {
                                setDetailOrder(order.id);
                                setActiveMenu(null);
                              }}
                              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-text-primary hover:bg-neutral-50 transition-colors"
                            >
                              <ViewIcon size={16} />
                              View Details
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

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDetailOrder(null)} />
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-lg p-6 mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-text-primary">
                Order #{selectedOrder.id.slice(0, 8)}
              </h3>
              <span className={STATUS_BADGE[selectedOrder.status].class}>
                {STATUS_BADGE[selectedOrder.status].label}
              </span>
            </div>

            {/* Shipping Address */}
            <div className="mb-4">
              <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Shipping Address</p>
              <div className="bg-neutral-50 rounded-md p-3 text-sm text-text-secondary">
                <p className="font-medium text-text-primary">{selectedOrder.addressSnapshot?.fullName}</p>
                <p>{selectedOrder.addressSnapshot?.street}</p>
                <p>
                  {selectedOrder.addressSnapshot?.district && `${selectedOrder.addressSnapshot.district}, `}
                  {selectedOrder.addressSnapshot?.city}
                  {selectedOrder.addressSnapshot?.postalCode && ` ${selectedOrder.addressSnapshot.postalCode}`}
                </p>
                {selectedOrder.addressSnapshot?.phone && (
                  <p className="mt-1">{selectedOrder.addressSnapshot.phone}</p>
                )}
              </div>
            </div>

            {/* Items */}
            <div className="mb-4">
              <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Items</p>
              <div className="divide-y divide-border-light border border-border rounded-md">
                {selectedOrder.items?.map((item) => (
                  <div key={item.id} className="flex items-center justify-between px-3 py-2.5">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-text-primary truncate">{item.productName}</p>
                      <p className="text-xs text-text-muted">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-medium text-text-primary ml-3">
                      ₺{Number(item.unitPrice).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="flex items-center justify-between pt-3 border-t border-border">
              <span className="text-sm font-semibold text-text-primary">Total</span>
              <span className="text-lg font-bold text-text-primary">
                ₺{Number(selectedOrder.totalAmount).toLocaleString()}
              </span>
            </div>

            <div className="flex justify-end mt-5">
              <button onClick={() => setDetailOrder(null)} className="btn btn-sm btn-ghost">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
