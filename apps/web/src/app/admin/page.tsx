'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  ShoppingBag01Icon,
  Invoice01Icon,
  CreditCardIcon,
  AnalyticsUpIcon,
  ArrowRight01Icon,
} from 'hugeicons-react';
import { adminOrderListQuery } from '@/lib/queries/orders/queries';
import { adminPaymentListQuery } from '@/lib/queries/payments/queries';
import { adminProductListQuery } from '@/lib/queries/catalog/queries';
import { gatewayHealthQuery } from '@/lib/queries/admin/queries';

const ORDER_STATUS_BADGE: Record<string, string> = {
  PENDING: 'badge badge-orange',
  CONFIRMED: 'badge badge-blue',
  COMPLETED: 'badge badge-green',
  FAILED: 'badge badge-red',
  CANCELLED: 'badge badge-gray',
};

export default function AdminDashboardPage() {
  // Aggregate stats from existing endpoints (limit=1 to just get meta.total)
  const { data: allOrders, isLoading: ordersLoading } = useQuery(adminOrderListQuery({ limit: 1 }));
  const { data: pendingOrders } = useQuery(adminOrderListQuery({ limit: 1, status: 'PENDING' }));
  const { data: products, isLoading: productsLoading } = useQuery(adminProductListQuery({ limit: 1 }));
  const { data: payments, isLoading: paymentsLoading } = useQuery(adminPaymentListQuery({ limit: 1 }));
  const { data: recentOrders } = useQuery(adminOrderListQuery({ limit: 5 }));
  const { data: health } = useQuery(gatewayHealthQuery());

  const statsLoading = ordersLoading || productsLoading || paymentsLoading;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
        <p className="text-sm text-text-secondary mt-1">Overview of your platform</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Products"
          value={products?.meta?.total}
          icon={<ShoppingBag01Icon size={20} />}
          href="/admin/products"
          loading={statsLoading}
        />
        <StatCard
          label="Total Orders"
          value={allOrders?.meta?.total}
          icon={<Invoice01Icon size={20} />}
          href="/admin/orders"
          loading={statsLoading}
        />
        <StatCard
          label="Total Payments"
          value={payments?.meta?.total}
          icon={<CreditCardIcon size={20} />}
          href="/admin/payments"
          loading={statsLoading}
        />
        <StatCard
          label="Pending Orders"
          value={pendingOrders?.meta?.total}
          icon={<AnalyticsUpIcon size={20} />}
          href="/admin/orders"
          loading={statsLoading}
          accent
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="xl:col-span-2 bg-surface rounded-lg border border-border">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="text-sm font-semibold text-text-primary">Recent Orders</h2>
            <Link href="/admin/orders" className="text-xs text-orange-500 hover:text-orange-600 font-medium flex items-center gap-1">
              View all <ArrowRight01Icon size={14} />
            </Link>
          </div>

          {recentOrders?.data?.length ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="px-5 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Order ID</th>
                  <th className="px-5 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Amount</th>
                  <th className="px-5 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.data.map((order) => (
                  <tr key={order.id} className="border-b border-border-light last:border-b-0 hover:bg-neutral-50 transition-colors">
                    <td className="px-5 py-3 font-medium text-text-primary">
                      #{order.id.slice(0, 8)}
                    </td>
                    <td className="px-5 py-3 text-text-secondary">
                      ₺{Number(order.totalAmount).toLocaleString()}
                    </td>
                    <td className="px-5 py-3">
                      <span className={ORDER_STATUS_BADGE[order.status] ?? 'badge badge-gray'}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-text-muted">
                      {new Date(order.createdAt).toLocaleDateString('tr-TR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state py-12">
              <p className="text-sm">No orders yet</p>
            </div>
          )}
        </div>

        {/* Gateway Health */}
        <div className="bg-surface rounded-lg border border-border">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="text-sm font-semibold text-text-primary">System Health</h2>
          </div>

          {health?.info ? (
            <div className="divide-y divide-border-light">
              {Object.entries(health.info).map(([name, svc]) => (
                <div key={name} className="flex items-center justify-between px-5 py-3">
                  <div className="flex items-center gap-3">
                    <span className={`w-2 h-2 rounded-full ${svc.status === 'up' ? 'bg-success' : 'bg-error'}`} />
                    <span className="text-sm text-text-primary capitalize">{name}</span>
                  </div>
                  <span className="text-xs text-text-muted capitalize">{svc.status}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state py-12">
              <p className="text-sm">Health data unavailable</p>
            </div>
          )}

          {health?.status && (
            <div className="px-5 py-3 border-t border-border bg-neutral-50 rounded-b-lg">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Overall</span>
                <span className={`text-xs font-bold capitalize ${
                  health.status === 'ok' ? 'text-success' : 'text-error'
                }`}>
                  {health.status === 'ok' ? 'Healthy' : health.status}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  href,
  loading,
  accent,
}: {
  label: string;
  value?: string | number;
  icon: React.ReactNode;
  href: string;
  loading?: boolean;
  accent?: boolean;
}) {
  return (
    <Link href={href} className="group">
      <div className={`bg-surface rounded-lg border p-4 transition-all hover:shadow-hover hover:-translate-y-0.5 ${
        accent ? 'border-orange-200 bg-orange-50/40' : 'border-border'
      }`}>
        <div className={`w-9 h-9 rounded-md flex items-center justify-center mb-3 ${
          accent ? 'bg-orange-100 text-orange-600' : 'bg-neutral-100 text-text-secondary'
        }`}>
          {icon}
        </div>
        {loading ? (
          <div className="skeleton h-7 w-16 mb-1" />
        ) : (
          <p className="text-xl font-bold text-text-primary">{value ?? '—'}</p>
        )}
        <p className="text-xs text-text-muted mt-0.5">{label}</p>
      </div>
    </Link>
  );
}
