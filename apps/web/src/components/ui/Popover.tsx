'use client';

import { useRef, useEffect } from 'react';

interface PopoverProps {
  open: boolean;
  onClose?: () => void;
  children: React.ReactNode;
  className?: string;
  /** Alignment relative to trigger: 'left' | 'right' | 'center' */
  align?: 'left' | 'right' | 'center';
  /** Min width override */
  minWidth?: number;
}

/**
 * Global Popover — all dropdowns/menus use this for consistent look & feel.
 * Animation is pure CSS (opacity + translate), no Framer Motion.
 */
export function Popover({
  open,
  onClose,
  children,
  className = '',
  align = 'left',
  minWidth,
}: PopoverProps) {
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open || !onClose) return;
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose?.();
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, onClose]);

  const alignClass =
    align === 'right' ? 'right-0' : align === 'center' ? 'left-1/2 -translate-x-1/2' : 'left-0';

  return (
    <div
      ref={ref}
      role="dialog"
      aria-hidden={!open}
      style={{ minWidth }}
      className={[
        'absolute top-full mt-1 z-[200]',
        'bg-white border border-[var(--color-border)] rounded-[var(--radius-lg)] shadow-[var(--shadow-dropdown)]',
        'transition-all duration-150 origin-top',
        open ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none',
        alignClass,
        className,
      ].join(' ')}
    >
      {children}
    </div>
  );
}
