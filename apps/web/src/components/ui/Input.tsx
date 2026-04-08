'use client';

import { forwardRef, useState } from 'react';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
  hint?: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search';
  /** Content to render on the left side inside the input */
  prefix?: React.ReactNode;
  /** Content to render on the right side inside the input (overridden by password toggle) */
  suffix?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, type = 'text', prefix, suffix, className = '', id, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

    const baseInput = [
      'w-full text-sm bg-white outline-none transition-colors',
      'placeholder:text-[var(--color-text-muted)]',
      'text-[var(--color-text-primary)]',
      prefix ? 'pl-9' : 'pl-3.5',
      isPassword || suffix ? 'pr-10' : 'pr-3.5',
      'py-2.5',
      className,
    ].join(' ');

    const wrapperClass = [
      'relative flex items-center rounded-[var(--radius-md)] border transition-colors',
      error
        ? 'border-red-400 bg-red-50 focus-within:border-red-500'
        : 'border-[var(--color-border)] bg-white focus-within:border-orange-500',
    ].join(' ');

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-[var(--color-text-primary)] select-none"
          >
            {label}
          </label>
        )}

        <div className={wrapperClass}>
          {prefix && (
            <span className="absolute left-3 text-[var(--color-text-muted)] pointer-events-none flex items-center">
              {prefix}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            type={inputType}
            className={baseInput}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
            {...props}
          />

          {isPassword ? (
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors flex items-center"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0 1 12 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 0 1 1.563-3.029m5.858.908a3 3 0 1 1 4.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532 3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0 1 12 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 0 1-4.132 4.411m0 0L21 21" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          ) : suffix ? (
            <span className="absolute right-3 text-[var(--color-text-muted)] flex items-center pointer-events-none">
              {suffix}
            </span>
          ) : null}
        </div>

        {error && (
          <p id={`${inputId}-error`} className="text-xs text-red-500 flex items-center gap-1">
            <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0zm-7 4a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm-1-9a1 1 0 0 0-1 1v4a1 1 0 1 0 2 0V6a1 1 0 0 0-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </p>
        )}

        {hint && !error && (
          <p id={`${inputId}-hint`} className="text-xs text-[var(--color-text-muted)]">
            {hint}
          </p>
        )}
      </div>
    );
  },
);
Input.displayName = 'Input';

export { Input };
