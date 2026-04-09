'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLogout } from '@/lib/queries/auth/mutations';

export default function LogoutPage() {
  const router = useRouter();
  const logout = useLogout();

  useEffect(() => {
    logout.mutate(undefined, {
      onSettled: () => {
        router.replace('/login');
      },
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen bg-page flex items-center justify-center">
      <div className="text-center">
        <div className="spinner mx-auto mb-4" />
        <p className="text-sm text-text-secondary">Signing out...</p>
      </div>
    </div>
  );
}
