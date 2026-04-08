'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  DashboardSquare01Icon,
  UserGroupIcon,
  ShoppingBag01Icon,
  Grid02Icon,
  Invoice01Icon,
  CreditCardIcon,
  Package01Icon,
  Notification01Icon,
  Analytics01Icon,
  Settings01Icon,
  Logout01Icon,
  ShieldUserIcon,
} from 'hugeicons-react';

const NAV_SECTIONS = [
  {
    title: 'Main',
    items: [
      { label: 'Dashboard', href: '/admin', icon: DashboardSquare01Icon },
      { label: 'Users', href: '/admin/users', icon: UserGroupIcon },
    ],
  },
  {
    title: 'Commerce',
    items: [
      { label: 'Products', href: '/admin/products', icon: ShoppingBag01Icon },
      { label: 'Categories', href: '/admin/categories', icon: Grid02Icon },
      { label: 'Orders', href: '/admin/orders', icon: Invoice01Icon },
      { label: 'Payments', href: '/admin/payments', icon: CreditCardIcon },
      { label: 'Inventory', href: '/admin/inventory', icon: Package01Icon },
    ],
  },
  {
    title: 'System',
    items: [
      { label: 'Notifications', href: '/admin/notifications', icon: Notification01Icon },
      { label: 'Monitoring', href: '/admin/monitoring', icon: Analytics01Icon },
      { label: 'Settings', href: '/admin/settings', icon: Settings01Icon },
    ],
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);

  return (
    <aside className="admin-sidebar">
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-5 h-16 border-b border-white/10 shrink-0">
        <div className="w-8 h-8 rounded-md bg-orange-500 flex items-center justify-center">
          <ShieldUserIcon size={18} className="text-white" />
        </div>
        <div className="leading-tight">
          <p className="text-sm font-bold text-white tracking-wide">Saganet</p>
          <p className="text-[10px] text-neutral-400 uppercase tracking-widest">Admin Panel</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 scrollbar-thin">
        {NAV_SECTIONS.map((section) => (
          <div key={section.title} className="mb-5">
            <p className="px-3 mb-2 text-[10px] font-semibold text-neutral-500 uppercase tracking-widest">
              {section.title}
            </p>
            <ul className="flex flex-col gap-0.5">
              {section.items.map((item) => {
                const active = isActive(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`
                        flex items-center gap-3 px-3 py-2.5 rounded-md text-[13px] font-medium
                        transition-colors duration-150
                        ${active
                          ? 'bg-orange-500/15 text-orange-400'
                          : 'text-neutral-400 hover:bg-white/10 hover:text-white'
                        }
                      `}
                    >
                      <item.icon size={20} strokeWidth={active ? 2 : 1.5} />
                      <span>{item.label}</span>
                      {active && (
                        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-orange-400" />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-white/10 px-3 py-3 shrink-0">
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-md text-[13px] font-medium text-neutral-500 hover:bg-white/10 hover:text-white transition-colors duration-150"
        >
          <Logout01Icon size={20} strokeWidth={1.5} />
          <span>Back to Store</span>
        </Link>
      </div>
    </aside>
  );
}
