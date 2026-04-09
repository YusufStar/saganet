import { Suspense } from 'react';
import AdminApplicationDetailPage from './detail';

export default function Page() {
  return (
    <Suspense fallback={
      <div className="space-y-5">
        <div className="skeleton h-8 w-64" />
        <div className="bg-surface rounded-lg border border-border p-6 space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton h-5 w-full" />
          ))}
        </div>
      </div>
    }>
      <AdminApplicationDetailPage />
    </Suspense>
  );
}
