'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/Input';
import { useRegister } from '@/lib/queries/auth/mutations';
import { ApiError } from '@/lib/api/client';

const schema = z
  .object({
    email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters').max(128),
    confirm: z.string().min(1, 'Please confirm your password'),
  })
  .refine((d) => d.password === d.confirm, {
    message: 'Passwords do not match',
    path: ['confirm'],
  });

type FormData = z.infer<typeof schema>;

function StrengthBar({ password }: { password: string }) {
  if (!password) return null;
  const level = password.length >= 16 ? 3 : password.length >= 12 ? 2 : 1;
  return (
    <div className="flex gap-1 mt-2">
      {[1, 2, 3].map((l) => (
        <div
          key={l}
          className={[
            'h-1 flex-1 rounded-full transition-colors duration-200',
            level >= l
              ? l === 1 ? 'bg-red-400' : l === 2 ? 'bg-yellow-400' : 'bg-green-400'
              : 'bg-border',
          ].join(' ')}
        />
      ))}
    </div>
  );
}

export default function RegisterPage() {
  const [success, setSuccess] = useState(false);
  const [successEmail, setSuccessEmail] = useState('');
  const registerMutation = useRegister();

  const { register, handleSubmit, setError, watch, formState: { errors, isSubmitting } } =
    useForm<FormData>({ resolver: zodResolver(schema) });

  const password = watch('password', '');

  async function onSubmit(data: FormData) {
    try {
      await registerMutation.mutateAsync({ email: data.email, password: data.password });
      setSuccessEmail(data.email);
      setSuccess(true);
    } catch (err) {
      const message =
        err instanceof ApiError && err.status === 409
          ? 'An account with this email already exists.'
          : 'Something went wrong. Please try again.';
      setError('root', { message });
    }
  }

  if (success) {
    return (
      <div className="text-center py-4">
        <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-text-primary mb-2">Account created!</h2>
        <p className="text-sm text-text-secondary mb-1">We sent a verification link to</p>
        <p className="text-sm font-semibold text-text-primary mb-6">{successEmail}</p>
        <Link
          href="/login"
          className="inline-block px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm rounded-md transition-colors"
        >
          Go to Sign In
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Create account</h1>
        <p className="text-sm text-text-secondary mt-1">
          Join Saganet and start shopping today.
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

        <div>
          <Input
            label="Password"
            type="password"
            placeholder="Min. 8 characters"
            autoComplete="new-password"
            error={errors.password?.message}
            {...register('password')}
          />
          <StrengthBar password={password} />
        </div>

        <Input
          label="Confirm Password"
          type="password"
          placeholder="Repeat your password"
          autoComplete="new-password"
          error={errors.confirm?.message}
          {...register('confirm')}
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
          disabled={isSubmitting || registerMutation.isPending}
          className="w-full py-2.5 px-4 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-md transition-colors flex items-center justify-center gap-2"
        >
          {(isSubmitting || registerMutation.isPending) ? (
            <>
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Creating account...
            </>
          ) : 'Create account'}
        </button>

        <p className="text-center text-xs text-text-muted">
          By creating an account you agree to our{' '}
          <Link href="/terms" className="text-orange-500 hover:underline">Terms of Service</Link>
          {' '}and{' '}
          <Link href="/privacy" className="text-orange-500 hover:underline">Privacy Policy</Link>.
        </p>
      </form>

      <p className="mt-6 text-center text-sm text-text-secondary">
        Already have an account?{' '}
        <Link href="/login" className="text-orange-500 font-semibold hover:underline">Sign in</Link>
      </p>
    </>
  );
}
