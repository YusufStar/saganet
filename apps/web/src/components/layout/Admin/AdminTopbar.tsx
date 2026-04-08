'use client';

import { useQuery } from '@tanstack/react-query';
import {
  Notification01Icon,
  Search01Icon,
  Menu01Icon,
} from 'hugeicons-react';
import { profileQuery } from '@/lib/queries/auth/queries';

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Administrator',
  VENDOR: 'Vendor',
  CUSTOMER: 'Customer',
};

interface AdminTopbarProps {
  onToggleSidebar?: () => void;
}

export function AdminTopbar({ onToggleSidebar }: AdminTopbarProps) {
  const { data: profile } = useQuery({ ...profileQuery(), retry: false });

  const initials = profile?.displayName
    ? profile.displayName.charAt(0).toUpperCase()
    : profile?.email
      ? profile.email.charAt(0).toUpperCase()
      : 'A';

  const name = profile?.displayName || profile?.email || 'Admin';
  const roleBadge = profile?.role ? ROLE_LABELS[profile.role] ?? profile.role : 'Admin';

  return (
    <header className="admin-topbar">
      {/* Left */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden flex items-center justify-center w-9 h-9 rounded-md hover:bg-neutral-100 transition-colors"
        >
          <Menu01Icon size={20} className="text-text-secondary" />
        </button>

        <div className="relative hidden sm:flex items-center">
          <Search01Icon
            size={16}
            className="absolute top-1/2 -translate-y-1/2 left-3 text-text-muted pointer-events-none"
          />
          <input
            type="text"
            placeholder="Search..."
            className="input h-9 w-64 pl-9 text-xs rounded-md"
          />
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2 shrink-0">
        <button className="relative flex items-center justify-center w-9 h-9 rounded-md hover:bg-neutral-100 transition-colors">
          <Notification01Icon size={20} className="text-text-secondary" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full" />
        </button>

        <div className="w-px h-6 bg-border mx-1" />

        <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-md hover:bg-neutral-50 transition-colors cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xs font-bold shrink-0">
            {initials}
          </div>
          <div className="hidden sm:block leading-tight">
            <p className="text-xs font-semibold text-text-primary truncate max-w-[140px]">
              {name}
            </p>
            <p className="text-[10px] text-text-muted">{roleBadge}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
