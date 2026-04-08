'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/Input';
import { useResetPassword } from '@/lib/queries/auth/mutations';
import { ApiError } from '@/lib/api/client';

const schema = z
  .object({
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
  const labels = ['Weak', 'Good', 'Strong'];
  const labelColors = ['text-red-500', 'text-yellow-500', 'text-green-500'];
  const barColors = ['bg-red-400', 'bg-yellow-400', 'bg-green-400'];
  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[1, 2, 3].map((l) => (
          <div
            key={l}
            className={[
              'h-1 flex-1 rounded-full transition-colors duration-200',
              level >= l ? barColors[l - 1] : 'bg-[var(--color-border)]',
            ].join(' ')}
          />
        ))}
      </div>
      <p className={`text-xs font-medium ${labelColors[level - 1]}`}>{labels[level - 1]}</p>
    </div>
  );
}

export default function ResetPasswordPage() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get('token');
  const resetPassword = useResetPassword();

  const { register, handleSubmit, setError, watch, formState: { errors, isSubmitting } } =
    useForm<FormData>({ resolver: zodResolver(schema) });

  const password = watch('password', '');

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

  async function onSubmit(data: FormData) {
    try {
      await resetPassword.mutateAsync({ token: token!, password: data.password });
      router.push('/login?reset=1');
    } catch (err) {
      const message =
        err instanceof ApiError && err.status === 400
          ? 'This reset link has expired. Please request a new one.'
          : 'Something went wrong. Please try again.';
      setError('root', { message });
    }
  }

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Set new password</h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">
          Choose a strong password for your account.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div>
          <Input
            label="New Password"
            type="password"
            placeholder="Min. 8 characters"
            autoComplete="new-password"
            autoFocus
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
          <div className="flex items-start gap-2 px-3.5 py-2.5 bg-red-50 border border-red-200 rounded-[var(--radius-md)] text-sm text-red-600">
            <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0zm-7 4a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm-1-9a1 1 0 0 0-1 1v4a1 1 0 1 0 2 0V6a1 1 0 0 0-1-1z" clipRule="evenodd" />
            </svg>
            <span>{errors.root.message}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting || resetPassword.isPending}
          className="w-full py-2.5 px-4 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-[var(--radius-md)] transition-colors flex items-center justify-center gap-2"
        >
          {(isSubmitting || resetPassword.isPending) ? (
            <>
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Saving…
            </>
          ) : 'Set New Password'}
        </button>
      </form>
    </>
  );
}
