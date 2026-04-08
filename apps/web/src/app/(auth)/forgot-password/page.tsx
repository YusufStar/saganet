'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForgotPassword } from '@/lib/queries/auth/mutations';
import { ApiError } from '@/lib/api/client';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const forgotPassword = useForgotPassword();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      await forgotPassword.mutateAsync({ email });
      setSent(true);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Something went wrong. Please try again.');
      }
    }
  }

  if (sent) {
    return (
      <div className="text-center py-4">
        <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 0 0 2.22 0L21 8M5 19h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-2">Check your inbox</h2>
        <p className="text-sm text-[var(--color-text-secondary)] mb-1">
          We sent a password reset link to
        </p>
        <p className="text-sm font-semibold text-[var(--color-text-primary)] mb-6">{email}</p>
        <p className="text-xs text-[var(--color-text-muted)] mb-6">
          Didn&apos;t receive it? Check your spam folder or{' '}
          <button
            type="button"
            onClick={() => setSent(false)}
            className="text-orange-500 hover:underline"
          >
            try again
          </button>.
        </p>
        <Link href="/login" className="text-sm text-[var(--color-text-secondary)] hover:text-orange-500 transition-colors">
          ← Back to Sign In
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Forgot password?</h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">
          Enter your email and we&apos;ll send you a reset link.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            autoFocus
            className="w-full px-3.5 py-2.5 text-sm rounded-[var(--radius-md)] border border-[var(--color-border)] focus:border-orange-500 bg-white placeholder:text-[var(--color-text-muted)] outline-none transition-colors"
          />
        </div>

        {error && (
          <div className="flex items-center gap-2 px-3.5 py-2.5 bg-red-50 border border-red-200 rounded-[var(--radius-md)] text-sm text-red-600">
            <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0zm-7 4a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm-1-9a1 1 0 0 0-1 1v4a1 1 0 1 0 2 0V6a1 1 0 0 0-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={forgotPassword.isPending}
          className="w-full py-2.5 px-4 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-[var(--radius-md)] transition-colors flex items-center justify-center gap-2"
        >
          {forgotPassword.isPending ? (
            <>
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Sending…
            </>
          ) : (
            'Send Reset Link'
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-sm">
        <Link href="/login" className="text-[var(--color-text-secondary)] hover:text-orange-500 transition-colors">
          ← Back to Sign In
        </Link>
      </p>
    </>
  );
}
