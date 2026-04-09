'use client';

import { Modal } from './Modal';
import { Button } from './Button';

interface AlertDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  /** Variant for the confirm button */
  variant?: 'danger' | 'success' | 'primary';
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  /** Optional icon placed before the title row */
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

/**
 * Confirm / cancel dialog built on top of Modal.
 * Use for destructive or significant actions that need explicit user consent.
 */
export function AlertDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  variant = 'danger',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  loading,
  icon,
  children,
}: AlertDialogProps) {
  return (
    <Modal open={open} onClose={onClose} maxWidth="max-w-md">
      <div className="flex items-start gap-3 mb-4">
        {icon && <div className="shrink-0">{icon}</div>}
        <div>
          <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
          {description && <p className="text-xs text-text-secondary mt-0.5">{description}</p>}
        </div>
      </div>

      {children}

      <div className="flex justify-end gap-2 mt-5">
        <Button variant="ghost" onClick={onClose} disabled={loading}>
          {cancelLabel}
        </Button>
        <Button variant={variant} onClick={onConfirm} loading={loading}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
