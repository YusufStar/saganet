'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft01Icon,
  CheckmarkCircle01Icon,
  Cancel01Icon,
  FileAttachmentIcon,
  UserAccountIcon,
  Building06Icon,
  Location01Icon,
  CreditCardIcon,
  Clock01Icon,
  AlertCircleIcon,
} from 'hugeicons-react';
import { adminVendorApplicationDetailQuery } from '@/lib/queries/auth/queries';
import {
  useApproveVendorApplication,
  useRejectVendorApplication,
} from '@/lib/queries/auth/mutations';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { AlertDialog } from '@/components/ui/AlertDialog';

const STATUS_BADGE: Record<string, { class: string; label: string }> = {
  PENDING: { class: 'badge badge-orange', label: 'Pending Review' },
  APPROVED: { class: 'badge badge-green', label: 'Approved' },
  REJECTED: { class: 'badge badge-red', label: 'Rejected' },
};

export default function AdminApplicationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const { data: app, isLoading } = useQuery(adminVendorApplicationDetailQuery(id));

  const approve = useApproveVendorApplication();
  const reject = useRejectVendorApplication();

  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [approveStep, setApproveStep] = useState<number | null>(null);

  const handleReject = () => {
    reject.mutate(
      { id, body: rejectReason.trim() ? { reason: rejectReason.trim() } : undefined },
      {
        onSuccess: () => {
          setShowRejectDialog(false);
          setRejectReason('');
          router.push('/admin/applications');
        },
      },
    );
  };

  const handleApprove = () => {
    approve.mutate(id, {
      onSuccess: () => {
        setApproveStep(null);
        router.push('/admin/applications');
      },
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-5">
        <div className="skeleton h-8 w-64" />
        <div className="bg-surface rounded-lg border border-border p-6 space-y-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="skeleton h-5 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!app) {
    return (
      <div className="text-center py-20">
        <p className="text-text-muted">Application not found</p>
        <Link href="/admin/applications" className="btn btn-sm btn-ghost mt-4">
          Back to Applications
        </Link>
      </div>
    );
  }

  const statusMeta = STATUS_BADGE[app.status] ?? STATUS_BADGE.PENDING;
  const isPending = app.status === 'PENDING';

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('tr-TR', {
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link
            href="/admin/applications"
            className="inline-flex items-center gap-1 text-xs text-text-muted hover:text-text-primary transition-colors mb-3"
          >
            <ArrowLeft01Icon size={14} />
            Back to Applications
          </Link>
          <h1 className="text-2xl font-bold text-text-primary">
            {app.firstName} {app.lastName}
          </h1>
          <p className="text-sm text-text-secondary mt-1">{app.companyName}</p>
        </div>
        <span className={statusMeta.class}>{statusMeta.label}</span>
      </div>

      {/* Meta bar */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-text-muted">
        <div className="flex items-center gap-1.5">
          <Clock01Icon size={14} />
          <span>Applied: {formatDate(app.createdAt)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock01Icon size={14} />
          <span>Updated: {formatDate(app.updatedAt)}</span>
        </div>
        {app.reviewedAt && (
          <div className="flex items-center gap-1.5">
            <CheckmarkCircle01Icon size={14} />
            <span>Reviewed: {formatDate(app.reviewedAt)}</span>
          </div>
        )}
        <span className="text-text-disabled">ID: {app.id.slice(0, 8)}</span>
      </div>

      {/* Rejection reason banner */}
      {app.rejectionReason && (
        <div className="flex items-start gap-3 p-4 bg-error-bg border border-red-200 rounded-lg">
          <AlertCircleIcon size={18} className="text-error shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-error">Rejection Reason</p>
            <p className="text-sm text-error/80 mt-0.5">{app.rejectionReason}</p>
          </div>
        </div>
      )}

      {/* Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Section icon={UserAccountIcon} title="Personal Information">
          <Row label="First Name" value={app.firstName} />
          <Row label="Last Name" value={app.lastName} />
          <Row label="Identity Number" value={app.identityNumber} />
          <Row label="Phone" value={app.phone} />
        </Section>

        <Section icon={Building06Icon} title="Company Information">
          <Row label="Company Name" value={app.companyName} />
          <Row label="Company Type" value={app.companyType} />
          <Row label="Tax Number" value={app.taxNumber ?? '—'} />
          <Row label="Tax Office" value={app.taxOffice ?? '—'} />
        </Section>

        <Section icon={Location01Icon} title="Business Address">
          <Row label="Street" value={app.street} />
          <Row label="District" value={app.district ?? '—'} />
          <Row label="City" value={app.city} />
          <Row label="Postal Code" value={app.postalCode ?? '—'} />
        </Section>

        <Section icon={CreditCardIcon} title="Bank Account">
          <Row label="IBAN" value={app.iban} mono />
          <Row label="Bank Name" value={app.bankName ?? '—'} />
        </Section>
      </div>

      {/* About */}
      {app.about && (
        <div className="bg-surface rounded-lg border border-border p-5">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">About the Business</p>
          <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">{app.about}</p>
        </div>
      )}

      {/* Documents */}
      <div className="bg-surface rounded-lg border border-border p-5">
        <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Documents</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <DocCard label="Identity Document" url={app.identityDocumentUrl} />
          <DocCard label="Tax Certificate" url={app.taxDocumentUrl} />
          <DocCard label="Signature Circular" url={app.signatureCircularUrl} />
        </div>
      </div>

      {/* Action Buttons */}
      {isPending && (
        <div className="flex items-center gap-3 pt-2">
          <Button variant="success" size="md" onClick={() => setApproveStep(0)}>
            <CheckmarkCircle01Icon size={18} />
            Approve Application
          </Button>
          <Button variant="danger" size="md" onClick={() => setShowRejectDialog(true)}>
            <Cancel01Icon size={18} />
            Reject Application
          </Button>
        </div>
      )}

      {/* ─── Reject AlertDialog ──────────────────────────────────────────────── */}
      <AlertDialog
        open={showRejectDialog}
        onClose={() => { setShowRejectDialog(false); setRejectReason(''); }}
        onConfirm={handleReject}
        title="Reject Application"
        description="This will deny the seller application."
        variant="danger"
        confirmLabel="Reject"
        loading={reject.isPending}
        icon={
          <div className="w-10 h-10 rounded-full bg-error-bg flex items-center justify-center">
            <Cancel01Icon size={20} className="text-error" />
          </div>
        }
      >
        <textarea
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          placeholder="Reason for rejection (optional)..."
          className="input w-full h-24 text-sm rounded-md resize-none py-2"
          autoFocus
        />
      </AlertDialog>

      {/* ─── Approve Step Modal ──────────────────────────────────────────────── */}
      <Modal open={approveStep !== null} onClose={() => setApproveStep(null)} maxWidth="max-w-lg">
        {approveStep !== null && (
          <>
            {/* Step indicator */}
            <div className="flex items-center gap-2 mb-6">
              {[0, 1, 2].map((s) => (
                <div key={s} className="flex items-center">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                    s < approveStep ? 'bg-success text-white' :
                    s === approveStep ? 'bg-orange-500 text-white' :
                    'bg-neutral-100 text-text-muted'
                  }`}>
                    {s < approveStep ? '✓' : s + 1}
                  </div>
                  {s < 2 && <div className={`w-8 h-px mx-1 ${s < approveStep ? 'bg-success' : 'bg-neutral-200'}`} />}
                </div>
              ))}
            </div>

            {/* Step 0: Applicant info */}
            {approveStep === 0 && (
              <div>
                <h3 className="text-lg font-semibold text-text-primary mb-1">Applicant Information</h3>
                <p className="text-xs text-text-secondary mb-4">Review the applicant&apos;s details before proceeding.</p>
                <div className="bg-neutral-50 rounded-md divide-y divide-border-light text-sm">
                  <ModalRow label="Name" value={`${app.firstName} ${app.lastName}`} />
                  <ModalRow label="Company" value={app.companyName} />
                  <ModalRow label="Type" value={app.companyType} />
                  <ModalRow label="City" value={app.city} />
                  <ModalRow label="IBAN" value={app.iban} mono />
                  <ModalRow label="Applied" value={formatDate(app.createdAt)} />
                </div>
              </div>
            )}

            {/* Step 1: Document confirmation */}
            {approveStep === 1 && (
              <div>
                <h3 className="text-lg font-semibold text-text-primary mb-1">Document Verification</h3>
                <p className="text-xs text-text-secondary mb-4">Please confirm you have reviewed all submitted documents.</p>
                <div className="space-y-3">
                  <DocStatus label="Identity Document" uploaded={!!app.identityDocumentUrl} url={app.identityDocumentUrl} />
                  <DocStatus label="Tax Certificate" uploaded={!!app.taxDocumentUrl} url={app.taxDocumentUrl} />
                  <DocStatus label="Signature Circular" uploaded={!!app.signatureCircularUrl} url={app.signatureCircularUrl} />
                </div>
                <div className="mt-4 p-3 bg-warning-bg rounded-md flex items-start gap-2">
                  <AlertCircleIcon size={16} className="text-warning shrink-0 mt-0.5" />
                  <p className="text-xs text-warning">
                    By proceeding, you confirm that you have reviewed and verified all submitted documents.
                  </p>
                </div>
              </div>
            )}

            {/* Step 2: Final confirmation */}
            {approveStep === 2 && (
              <div>
                <h3 className="text-lg font-semibold text-text-primary mb-1">Final Confirmation</h3>
                <p className="text-xs text-text-secondary mb-4">This action will:</p>
                <ul className="space-y-2 mb-4">
                  <li className="flex items-start gap-2 text-sm text-text-primary">
                    <CheckmarkCircle01Icon size={16} className="text-success shrink-0 mt-0.5" />
                    Approve the vendor application
                  </li>
                  <li className="flex items-start gap-2 text-sm text-text-primary">
                    <CheckmarkCircle01Icon size={16} className="text-success shrink-0 mt-0.5" />
                    Promote <strong>{app.firstName} {app.lastName}</strong> to <span className="badge badge-orange">VENDOR</span> role
                  </li>
                  <li className="flex items-start gap-2 text-sm text-text-primary">
                    <CheckmarkCircle01Icon size={16} className="text-success shrink-0 mt-0.5" />
                    Grant seller privileges for <strong>{app.companyName}</strong>
                  </li>
                </ul>
                <div className="p-3 bg-success-bg rounded-md flex items-start gap-2">
                  <AlertCircleIcon size={16} className="text-success shrink-0 mt-0.5" />
                  <p className="text-xs text-success">
                    Are you sure you want to approve this application? This action cannot be undone.
                  </p>
                </div>
              </div>
            )}

            {/* Nav */}
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
              <Button
                variant="ghost"
                onClick={() => approveStep === 0 ? setApproveStep(null) : setApproveStep(approveStep - 1)}
              >
                {approveStep === 0 ? 'Cancel' : 'Back'}
              </Button>
              {approveStep < 2 ? (
                <Button variant="primary" onClick={() => setApproveStep(approveStep + 1)}>
                  Continue
                </Button>
              ) : (
                <Button variant="success" onClick={handleApprove} loading={approve.isPending}>
                  <CheckmarkCircle01Icon size={16} />
                  Approve
                </Button>
              )}
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}

// ─── Page-specific sub-components ───────────────────────────────────────────────

function Section({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-surface rounded-lg border border-border p-5">
      <div className="flex items-center gap-2 mb-3">
        <Icon size={16} className="text-orange-500" />
        <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">{title}</p>
      </div>
      <div className="divide-y divide-border-light">{children}</div>
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5">
      <span className="text-xs text-text-muted">{label}</span>
      <span className={`text-sm text-text-primary ${mono ? 'font-mono text-xs' : ''}`}>{value}</span>
    </div>
  );
}

function ModalRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between px-4 py-2.5">
      <span className="text-text-muted">{label}</span>
      <span className={`text-text-primary ${mono ? 'font-mono text-xs' : 'font-medium'}`}>{value}</span>
    </div>
  );
}

function DocCard({ label, url }: { label: string; url?: string }) {
  return (
    <div className={`rounded-md border p-4 text-center ${url ? 'border-border bg-neutral-50' : 'border-dashed border-neutral-300 bg-neutral-50/50'}`}>
      <FileAttachmentIcon size={24} className={url ? 'text-orange-500 mx-auto mb-2' : 'text-text-disabled mx-auto mb-2'} />
      <p className="text-xs font-medium text-text-primary mb-1">{label}</p>
      {url ? (
        <a href={url} target="_blank" rel="noopener noreferrer" className="text-[11px] text-orange-500 hover:text-orange-600 font-medium">
          View Document
        </a>
      ) : (
        <p className="text-[11px] text-text-disabled">Not uploaded</p>
      )}
    </div>
  );
}

function DocStatus({ label, uploaded, url }: { label: string; uploaded: boolean; url?: string }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 bg-neutral-50 rounded-md">
      <div className="flex items-center gap-2">
        {uploaded ? (
          <CheckmarkCircle01Icon size={16} className="text-success" />
        ) : (
          <Cancel01Icon size={16} className="text-text-disabled" />
        )}
        <span className="text-sm text-text-primary">{label}</span>
      </div>
      {url ? (
        <a href={url} target="_blank" rel="noopener noreferrer" className="text-xs text-orange-500 hover:text-orange-600 font-medium">
          View
        </a>
      ) : (
        <span className="text-xs text-text-disabled">Missing</span>
      )}
    </div>
  );
}
