import { Suspense } from 'react';
import AdminLayoutClient from './layout-client';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense>
      <AdminLayoutClient>{children}</AdminLayoutClient>
    </Suspense>
  );
}
