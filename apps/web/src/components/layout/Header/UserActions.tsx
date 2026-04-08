'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  UserAccountIcon,
  FavouriteIcon,
  ShoppingCart01Icon,
  Store01Icon,
  ShieldUserIcon,
} from 'hugeicons-react';
import { profileQuery } from '@/lib/queries/auth/queries';
import { Popover } from '@/components/ui/Popover';
import { Tooltip } from '@/components/ui/Tooltip';

function ActionButton({
  href,
  tooltip,
  badge,
  children,
  popover,
  highlight,
}: {
  href: string;
  tooltip: string;
  badge?: number;
  children: React.ReactNode;
  popover?: React.ReactNode;
  highlight?: 'seller' | 'admin';
}) {
  const [open, setOpen] = useState(false);

  const colorClass =
    highlight === 'admin'
      ? 'text-purple-600 hover:bg-purple-50'
      : highlight === 'seller'
      ? 'text-orange-500 hover:bg-orange-50'
      : 'text-(--color-text-secondary) hover:bg-neutral-100';

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <Tooltip content={tooltip} position="bottom">
        <Link href={href}>
          <div className={`flex items-center justify-center w-10 h-10 rounded-(--radius-md) cursor-pointer transition-colors relative ${colorClass}`}>
            {children}
            {badge != null && badge > 0 && (
              <span className="absolute top-0.5 right-0.5 min-w-[16px] h-4 bg-orange-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-0.5 leading-none">
                {badge > 99 ? '99+' : badge}
              </span>
            )}
          </div>
        </Link>
      </Tooltip>

      {popover && (
        <Popover open={open} align="right" minWidth={224}>
          {popover}
        </Popover>
      )}
    </div>
  );
}

function ProfileDropdown({ displayName }: { displayName?: string }) {
  const items = [
    { label: 'My Profile', href: '/profile' },
    { label: 'My Orders', href: '/orders' },
    { label: 'My Addresses', href: '/addresses' },
    { label: 'My Reviews', href: '/reviews' },
  ];

  return (
    <>
      <div className="px-4 py-3 border-b border-(--color-border)">
        <p className="text-xs text-(--color-text-muted)">Welcome back!</p>
        <p className="text-sm font-semibold text-(--color-text-primary)">
          {displayName ?? 'User'}
        </p>
      </div>
      <div className="py-1">
        {items.map((item) => (
          <Link key={item.href} href={item.href}>
            <div className="px-4 py-2.5 text-sm text-(--color-text-primary) hover:bg-orange-50 hover:text-orange-500 transition-colors">
              {item.label}
            </div>
          </Link>
        ))}
        <div className="border-t border-(--color-border) mt-1 pt-1">
          <Link href="/logout">
            <div className="px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors">
              Sign Out
            </div>
          </Link>
        </div>
      </div>
    </>
  );
}

export function UserActions() {
  const { data: profile } = useQuery({ ...profileQuery(), retry: false });

  const isLoggedIn = !!profile;
  const isVendor = profile?.role === 'VENDOR';
  const isAdmin = profile?.role === 'ADMIN';

  return (
    <div className="flex items-center gap-1 flex-shrink-0">
      {isVendor && (
        <ActionButton href="/store" tooltip="My Store" highlight="seller">
          <Store01Icon size={22} />
        </ActionButton>
      )}

      {isAdmin && (
        <ActionButton href="/admin" tooltip="Admin Panel" highlight="admin">
          <ShieldUserIcon size={22} />
        </ActionButton>
      )}

      <ActionButton href="/favorites" tooltip="Favorites">
        <FavouriteIcon size={22} />
      </ActionButton>

      <ActionButton href="/cart" tooltip="Cart">
        <ShoppingCart01Icon size={22} />
      </ActionButton>

      <ActionButton
        href={isLoggedIn ? '/profile' : '/login'}
        tooltip={isLoggedIn ? 'My Profile' : 'Sign In'}
        popover={isLoggedIn ? <ProfileDropdown displayName={profile.displayName} /> : undefined}
      >
        <UserAccountIcon size={22} />
      </ActionButton>
    </div>
  );
}
