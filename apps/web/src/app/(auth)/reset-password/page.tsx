'use client';

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useResetPassword } from '@/lib/queries/auth/mutations';
import { ApiError } from '@/lib/api/client';

export default function ResetPasswordPage() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get('token');

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const resetPassword = useResetPassword();

  if (!token) {
    return (
      <div className="text-center py-4">
        <div className="w-14 h-14 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-2">Invalid link</h2>
        <p className="text-sm text-[var(--color-text-secondary)] mb-6">
          This reset link is missing or has expired. Please request a new one.
        </p>
        <Link
          href="/forgot-password"
          className="inline-block px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm rounded-[var(--radius-md)] transition-colors"
        >
          Request New Link
        </Link>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    try {
      await resetPassword.mutateAsync({ token: token!, password });
      router.push('/login?reset=1');
    } catch (err) {
      if (err instanceof ApiError) {
        setError(
          err.status === 400
            ? 'This reset link has expired. Please request a new one.'
            : err.message,
        );
      } else {
        setError('Something went wrong. Please try again.');
      }
    }
  }

  const strengthLevel = password.length >= 16 ? 3 : password.length >= 12 ? 2 : password.length >= 8 ? 1 : 0;
  const strengthLabel = ['', 'Weak', 'Good', 'Strong'][strengthLevel];
  const strengthColor = ['', 'text-red-500', 'text-yellow-500', 'text-green-500'][strengthLevel];

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Set new password</h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">
          Choose a strong password for your account.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* New Password */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-sm font-medium text-[var(--color-text-primary)]">New Password</label>
            {password.length > 0 && (
              <span className={`text-xs font-semibold ${strengthColor}`}>{strengthLabel}</span>
            )}
          </div>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 8 characters"
              required
              autoFocus
              autoComplete="new-password"
              className="w-full px-3.5 py-2.5 pr-10 text-sm rounded-[var(--radius-md)] border border-[var(--color-border)] focus:border-orange-500 bg-white placeholder:text-[var(--color-text-muted)] outline-none transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              tabIndex={-1}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
            >
              {showPassword ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0 1 12 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 0 1 1.563-3.029m5.858.908a3 3 0 1 1 4.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532 3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0 1 12 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 0 1-4.132 4.411m0 0L21 21" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth={2} />
                </svg>
              )}
            </button>
          </div>
          {/* Strength bars */}
          {password.length > 0 && (
            <div className="mt-2 flex gap-1">
              {[1, 2, 3].map((lvl) => (
                <div
                  key={lvl}
                  className={[
                    'h-1 flex-1 rounded-full transition-colors duration-200',
                    strengthLevel >= lvl
                      ? lvl === 1 ? 'bg-red-400' : lvl === 2 ? 'bg-yellow-400' : 'bg-green-400'
                      : 'bg-[var(--color-border)]',
                  ].join(' ')}
                />
              ))}
            </div>
          )}
        </div>

        {/* Confirm */}
        <div>
          <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">
            Confirm Password
          </label>
          <input
            type={showPassword ? 'text' : 'password'}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Repeat your password"
            required
            autoComplete="new-password"
            className={[
              'w-full px-3.5 py-2.5 text-sm rounded-[var(--radius-md)] border outline-none transition-colors placeholder:text-[var(--color-text-muted)]',
              confirm && confirm !== password
                ? 'border-red-400 bg-red-50'
                : 'border-[var(--color-border)] focus:border-orange-500 bg-white',
            ].join(' ')}
          />
        </div>

        {error && (
          <div className="flex items-start gap-2 px-3.5 py-2.5 bg-red-50 border border-red-200 rounded-[var(--radius-md)] text-sm text-red-600">
            <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0zm-7 4a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm-1-9a1 1 0 0 0-1 1v4a1 1 0 1 0 2 0V6a1 1 0 0 0-1-1z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={resetPassword.isPending}
          className="w-full py-2.5 px-4 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-[var(--radius-md)] transition-colors flex items-center justify-center gap-2"
        >
          {resetPassword.isPending ? (
            <>
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Saving…
            </>
          ) : (
            'Set New Password'
          )}
        </button>
      </form>
    </>
  );
}
