'use client';

import { useEffect, useRef } from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  /** Max width class, e.g. 'max-w-md', 'max-w-lg', 'max-w-2xl' */
  maxWidth?: string;
}

/**
 * Accessible overlay modal.
 * Closes on backdrop click and Escape key.
 */
export function Modal({ open, onClose, children, maxWidth = 'max-w-lg' }: ModalProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        className={`relative bg-white rounded-lg shadow-xl w-full ${maxWidth} p-6 mx-4 max-h-[85vh] overflow-y-auto`}
      >
        {children}
      </div>
    </div>
  );
}
