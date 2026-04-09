import { Suspense } from 'react';
import type { Metadata } from 'next';
import { QueryProvider } from '@/providers/query-provider';
import { NavigationRefresher } from '@/components/NavigationRefresher';
import './globals.css';

export const metadata: Metadata = {
  title: 'Saganet',
  description: 'Multi-vendor marketplace',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-page min-h-screen">
        <QueryProvider>
          <Suspense>
            <NavigationRefresher />
          </Suspense>
          <main>{children}</main>
        </QueryProvider>
      </body>
    </html>
  );
}
