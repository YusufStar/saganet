'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  FilterIcon,
  ArrowDown01Icon,
  ArrowUp01Icon,
  MoreHorizontalIcon,
  MoneyReceiveSquareIcon,
} from 'hugeicons-react';
import { adminPaymentListQuery } from '@/lib/queries/payments/queries';
import { useRefundPayment } from '@/lib/queries/payments/mutations';
import type { AdminPaymentListQuery, PaymentStatus } from '@/lib/api/types';
import { Popover } from '@/components/ui/Popover';

const STATUS_BADGE: Record<PaymentStatus, { class: string; label: string }> = {
  PENDING: { class: 'badge badge-orange', label: 'Pending' },
  COMPLETED: { class: 'badge badge-green', label: 'Completed' },
  FAILED: { class: 'badge badge-red', label: 'Failed' },
  REFUNDED: { class: 'badge badge-gray', label: 'Refunded' },
};

const STATUSES: PaymentStatus[] = ['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'];

export default function AdminPaymentsPage() {
  const [query, setQuery] = useState<AdminPaymentListQuery>({
    page: 1,
    limit: 20,
  });
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [refundTarget, setRefundTarget] = useState<string | null>(null);
  const [refundReason, setRefundReason] = useState('');

  const { data, isLoading } = useQuery(adminPaymentListQuery(query));
  const refundPayment = useRefundPayment();

  const payments = data?.data ?? [];
  const meta = data?.meta;

  const handleRefundSubmit = () => {
    if (!refundTarget) return;
    refundPayment.mutate(
      { id: refundTarget, body: refundReason ? { reason: refundReason } : undefined },
      {
        onSuccess: () => {
          setRefundTarget(null);
          setRefundReason('');
        },
      },
    );
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Payments</h1>
        <p className="text-sm text-text-secondary mt-1">Track payments and process refunds</p>
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
                status: (e.target.value || undefined) as PaymentStatus | undefined,
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
            {meta.total} payment{meta.total !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* Table */}
      <div className="bg-surface rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-neutral-50">
              <th className="text-left px-5 py-3">
                <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">Payment ID</span>
              </th>
              <th className="text-left px-5 py-3">
                <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">Order</span>
              </th>
              <th className="text-left px-5 py-3">
                <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">Amount</span>
              </th>
              <th className="text-left px-5 py-3">
                <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">Provider</span>
              </th>
              <th className="text-left px-5 py-3">
                <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">Status</span>
              </th>
              <th className="text-left px-5 py-3">
                <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">Date</span>
              </th>
              <th className="w-12 px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-border-light">
                  <td className="px-5 py-3"><div className="skeleton h-5 w-20" /></td>
                  <td className="px-5 py-3"><div className="skeleton h-5 w-20" /></td>
                  <td className="px-5 py-3"><div className="skeleton h-5 w-20" /></td>
                  <td className="px-5 py-3"><div className="skeleton h-5 w-16" /></td>
                  <td className="px-5 py-3"><div className="skeleton h-5 w-20" /></td>
                  <td className="px-5 py-3"><div className="skeleton h-5 w-24" /></td>
                  <td className="px-5 py-3" />
                </tr>
              ))
            ) : payments.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-16 text-center text-sm text-text-muted">
                  No payments found
                </td>
              </tr>
            ) : (
              payments.map((payment) => {
                const statusMeta = STATUS_BADGE[payment.status];
                const canRefund = payment.status === 'COMPLETED';
                return (
                  <tr key={payment.id} className="border-b border-border-light last:border-b-0 hover:bg-neutral-50 transition-colors">
                    {/* Payment ID */}
                    <td className="px-5 py-3">
                      <span className="font-medium text-text-primary">#{payment.id.slice(0, 8)}</span>
                    </td>
                    {/* Order */}
                    <td className="px-5 py-3 text-text-secondary text-xs">
                      #{payment.orderId.slice(0, 8)}
                    </td>
                    {/* Amount */}
                    <td className="px-5 py-3 font-medium text-text-primary">
                      ₺{Number(payment.amount).toLocaleString()}
                      <span className="text-xs text-text-muted ml-1">{payment.currency}</span>
                    </td>
                    {/* Provider */}
                    <td className="px-5 py-3 text-text-secondary text-xs capitalize">
                      {payment.provider}
                    </td>
                    {/* Status */}
                    <td className="px-5 py-3">
                      <span className={statusMeta.class}>{statusMeta.label}</span>
                    </td>
                    {/* Date */}
                    <td className="px-5 py-3 text-text-muted text-xs">
                      {new Date(payment.createdAt).toLocaleDateString('tr-TR', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    {/* Actions */}
                    <td className="px-5 py-3">
                      {canRefund && (
                        <div className="relative" onMouseLeave={() => setActiveMenu(null)}>
                          <button
                            onClick={() => setActiveMenu(activeMenu === payment.id ? null : payment.id)}
                            className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-neutral-100 transition-colors"
                          >
                            <MoreHorizontalIcon size={18} className="text-text-secondary" />
                          </button>

                          <Popover open={activeMenu === payment.id} align="right" minWidth={160}>
                            <div className="py-1">
                              <button
                                onClick={() => {
                                  setRefundTarget(payment.id);
                                  setActiveMenu(null);
                                }}
                                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-error hover:bg-error-bg transition-colors"
                              >
                                <MoneyReceiveSquareIcon size={16} />
                                Refund
                              </button>
                            </div>
                          </Popover>
                        </div>
                      )}
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

      {/* Refund Modal */}
      {refundTarget && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setRefundTarget(null)} />
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md p-6 mx-4">
            <h3 className="text-lg font-semibold text-text-primary mb-1">Process Refund</h3>
            <p className="text-sm text-text-secondary mb-4">
              Are you sure you want to refund this payment? This action cannot be undone.
            </p>
            <textarea
              value={refundReason}
              onChange={(e) => setRefundReason(e.target.value)}
              placeholder="Reason for refund (optional)..."
              className="input w-full h-24 text-sm rounded-md resize-none"
            />
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => {
                  setRefundTarget(null);
                  setRefundReason('');
                }}
                className="btn btn-sm btn-ghost"
              >
                Cancel
              </button>
              <button
                onClick={handleRefundSubmit}
                disabled={refundPayment.isPending}
                className="btn btn-sm bg-error text-white hover:bg-red-600 disabled:opacity-50"
              >
                Refund
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
