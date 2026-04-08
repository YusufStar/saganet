'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function NotFound() {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-[var(--color-page)] flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        {/* Big 404 */}
        <div className="relative mb-8">
          <span
            className="text-[160px] font-black leading-none select-none"
            style={{
              background: 'linear-gradient(135deg, #f97316 0%, #fb923c 50%, #fed7aa 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            404
          </span>
          {/* Floating badge */}
          <div className="absolute -top-2 -right-2 w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center shadow-lg rotate-12">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        </div>

        {/* Message */}
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-3">
          Page not found
        </h1>
        <p className="text-[var(--color-text-secondary)] text-sm leading-relaxed mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
          Let&apos;s get you back on track.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm rounded-[var(--radius-md)] transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 0 0 1 1h3m10-11l2 2m-2-2v10a1 1 0 0 1-1 1h-3m-6 0a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1m-6 0h6" />
            </svg>
            Go Home
          </Link>
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-white hover:bg-[var(--color-border)] text-[var(--color-text-primary)] font-semibold text-sm rounded-[var(--radius-md)] border border-[var(--color-border)] transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Go Back
          </button>
        </div>

        {/* Divider */}
        <div className="mt-10 pt-8 border-t border-[var(--color-border)]">
          <p className="text-xs text-[var(--color-text-muted)] mb-4">Popular pages</p>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm">
            {[
              { href: '/login', label: 'Sign In' },
              { href: '/register', label: 'Register' },
              { href: '/profile', label: 'My Account' },
              { href: '/orders', label: 'Orders' },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="text-[var(--color-text-secondary)] hover:text-orange-500 transition-colors"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
