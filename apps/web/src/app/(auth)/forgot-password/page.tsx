'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/Input';
import { useForgotPassword } from '@/lib/queries/auth/mutations';
import { ApiError } from '@/lib/api/client';

const schema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
});

type FormData = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [sentTo, setSentTo] = useState('');
  const forgotPassword = useForgotPassword();

  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } =
    useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    try {
      await forgotPassword.mutateAsync({ email: data.email });
      setSentTo(data.email);
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Something went wrong. Please try again.';
      setError('root', { message });
    }
  }

  if (sentTo) {
    return (
      <div className="text-center py-4">
        <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 0 0 2.22 0L21 8M5 19h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-text-primary mb-2">Check your inbox</h2>
        <p className="text-sm text-text-secondary mb-1">We sent a reset link to</p>
        <p className="text-sm font-semibold text-text-primary mb-6">{sentTo}</p>
        <p className="text-xs text-text-muted mb-6">
          Didn&apos;t receive it? Check spam or{' '}
          <button type="button" onClick={() => setSentTo('')} className="text-orange-500 hover:underline">
            try again
          </button>.
        </p>
        <Link href="/login" className="text-sm text-text-secondary hover:text-orange-500 transition-colors">
          ← Back to Sign In
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Forgot password?</h1>
        <p className="text-sm text-text-secondary mt-1">
          Enter your email and we&apos;ll send you a reset link.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          autoFocus
          error={errors.email?.message}
          {...register('email')}
        />

        {errors.root && (
          <div className="flex items-center gap-2 px-3.5 py-2.5 bg-red-50 border border-red-200 rounded-md text-sm text-red-600">
            <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0zm-7 4a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm-1-9a1 1 0 0 0-1 1v4a1 1 0 1 0 2 0V6a1 1 0 0 0-1-1z" clipRule="evenodd" />
            </svg>
            {errors.root.message}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting || forgotPassword.isPending}
          className="w-full py-2.5 px-4 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-md transition-colors flex items-center justify-center gap-2"
        >
          {(isSubmitting || forgotPassword.isPending) ? (
            <>
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Sending…
            </>
          ) : 'Send Reset Link'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm">
        <Link href="/login" className="text-text-secondary hover:text-orange-500 transition-colors">
          ← Back to Sign In
        </Link>
      </p>
    </>
  );
}
