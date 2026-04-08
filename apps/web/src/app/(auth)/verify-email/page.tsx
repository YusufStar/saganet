'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { authApi } from '@/lib/api/auth';
import { ApiError } from '@/lib/api/client';

type Status = 'loading' | 'success' | 'error' | 'missing';

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailContent />
    </Suspense>
  );
}

function VerifyEmailContent() {
  const params = useSearchParams();
  const token = params.get('token');
  const [status, setStatus] = useState<Status>(token ? 'loading' : 'missing');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) return;

    authApi
      .verifyEmail(token)
      .then((res) => {
        setMessage(res.message ?? 'Email verified successfully.');
        setStatus('success');
      })
      .catch((err) => {
        if (err instanceof ApiError) {
          setMessage(err.message);
        } else {
          setMessage('Verification failed. Please try again.');
        }
        setStatus('error');
      });
  }, [token]);

  if (status === 'missing') {
    return (
      <div className="text-center py-4">
        <div className="w-14 h-14 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-(--color-text-primary) mb-2">Invalid link</h2>
        <p className="text-sm text-(--color-text-secondary) mb-6">
          The verification link is missing or malformed.
        </p>
        <Link href="/login" className="text-orange-500 font-semibold hover:underline text-sm">
          Back to Sign In
        </Link>
      </div>
    );
  }

  if (status === 'loading') {
    return (
      <div className="text-center py-8">
        <svg className="w-10 h-10 animate-spin text-orange-500 mx-auto mb-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <p className="text-sm text-(--color-text-secondary)">Verifying your email…</p>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="text-center py-4">
        <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-(--color-text-primary) mb-2">Email verified!</h2>
        <p className="text-sm text-(--color-text-secondary) mb-6">{message}</p>
        <Link
          href="/login"
          className="inline-block px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm rounded-(--radius-md) transition-colors"
        >
          Sign In
        </Link>
      </div>
    );
  }

  // error
  return (
    <div className="text-center py-4">
      <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>
      <h2 className="text-xl font-bold text-(--color-text-primary) mb-2">Verification failed</h2>
      <p className="text-sm text-(--color-text-secondary) mb-6">{message}</p>
      <div className="flex flex-col gap-2 items-center">
        <Link href="/login" className="text-orange-500 font-semibold hover:underline text-sm">
          Back to Sign In
        </Link>
      </div>
    </div>
  );
}
