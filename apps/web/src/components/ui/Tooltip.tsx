'use client';

import { useState, useRef, useEffect } from 'react';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  /** Delay before showing in ms */
  delay?: number;
  position?: 'top' | 'bottom';
}

/**
 * Lightweight, animated Tooltip — CSS transitions only, no external deps.
 * Renders via a portal-like absolute div relative to the trigger.
 */
export function Tooltip({ content, children, delay = 400, position = 'bottom' }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function show() {
    timerRef.current = setTimeout(() => setVisible(true), delay);
  }

  function hide() {
    if (timerRef.current) clearTimeout(timerRef.current);
    setVisible(false);
  }

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  const posClass = position === 'top'
    ? 'bottom-full mb-2'
    : 'top-full mt-2';

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}

      <div
        role="tooltip"
        className={[
          'absolute left-1/2 -translate-x-1/2 z-[300] pointer-events-none',
          'whitespace-nowrap px-2.5 py-1.5',
          'bg-(--color-neutral-900) text-white text-[11px] font-medium rounded-(--radius-sm)',
          'shadow-(--shadow-modal)',
          'transition-all duration-150 origin-top',
          posClass,
          visible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-1',
        ].join(' ')}
      >
        {content}
        {/* Arrow */}
        <span
          className={[
            'absolute left-1/2 -translate-x-1/2 w-0 h-0',
            position === 'top'
              ? 'top-full border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-(--color-neutral-900)'
              : 'bottom-full border-l-4 border-r-4 border-b-4 border-l-transparent border-r-transparent border-b-(--color-neutral-900)',
          ].join(' ')}
        />
      </div>
    </div>
  );
}
