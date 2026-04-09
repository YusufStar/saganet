import { Suspense } from 'react';
import LogoutClient from './logout-client';

export default function LogoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-page flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4" />
          <p className="text-sm text-text-secondary">Signing out...</p>
        </div>
      </div>
    }>
      <LogoutClient />
    </Suspense>
  );
}
