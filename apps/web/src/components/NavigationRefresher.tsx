'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { authKeys } from '@/lib/queries/auth/query-keys';

/**
 * Invalidates the profile query on every navigation (including browser back/forward).
 * Next.js App Router serves cached pages on back/forward without remounting components,
 * so TanStack Query's refetchOnMount doesn't trigger — this fills that gap.
 */
export function NavigationRefresher() {
  const pathname = usePathname();
  const qc = useQueryClient();

  useEffect(() => {
    qc.invalidateQueries({ queryKey: authKeys.profile() });
  }, [pathname, qc]);

  return null;
}
