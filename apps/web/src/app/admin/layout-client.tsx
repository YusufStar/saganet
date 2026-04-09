'use client';

import { useState } from 'react';
import { AdminSidebar } from '@/components/layout/Admin/AdminSidebar';
import { AdminTopbar } from '@/components/layout/Admin/AdminTopbar';

export default function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-page">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div
        className={`
          fixed inset-y-0 left-0 z-50 w-[260px] transform transition-transform duration-200 ease-in-out
          lg:relative lg:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <AdminSidebar />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <AdminTopbar onToggleSidebar={() => setSidebarOpen((v) => !v)} />

        <main className="flex-1 overflow-y-auto p-6 scrollbar-thin">
          {children}
        </main>
      </div>
    </div>
  );
}
