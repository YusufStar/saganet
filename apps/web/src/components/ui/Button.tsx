import { forwardRef } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
type ButtonSize = 'sm' | 'md' | 'lg';

const VARIANT_CLASS: Record<ButtonVariant, string> = {
  primary: 'bg-orange-500 text-white hover:bg-orange-600',
  secondary: 'bg-transparent text-orange-500 border-[1.5px] border-orange-500 hover:bg-orange-50',
  ghost: 'bg-transparent text-text-secondary hover:bg-neutral-100 hover:text-text-primary',
  danger: 'bg-error text-white hover:bg-red-700',
  success: 'bg-success text-white hover:bg-green-600',
};

const SIZE_CLASS: Record<ButtonSize, string> = {
  sm: 'text-xs px-3 h-8 gap-1.5',
  md: 'text-sm px-4 h-[42px] gap-2',
  lg: 'text-base px-6 h-[52px] gap-2',
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'sm', loading, disabled, className = '', children, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={[
        'inline-flex items-center justify-center font-semibold rounded-sm whitespace-nowrap transition-colors select-none',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        VARIANT_CLASS[variant],
        SIZE_CLASS[size],
        className,
      ].join(' ')}
      {...props}
    >
      {loading && <span className="spinner !w-4 !h-4 !border-current !border-t-transparent" />}
      {children}
    </button>
  ),
);
Button.displayName = 'Button';

export { Button };
