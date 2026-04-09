'use client';

import { useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import {
  Store01Icon,
  UserAccountIcon,
  Building06Icon,
  Location01Icon,
  CreditCardIcon,
  FileAttachmentIcon,
  CheckmarkCircle01Icon,
  ArrowRight01Icon,
  ArrowLeft01Icon,
  Cancel01Icon,
  Upload04Icon,
  InformationCircleIcon,
  Clock01Icon,
} from 'hugeicons-react';
import { profileQuery, vendorApplicationQuery } from '@/lib/queries/auth/queries';
import {
  useCreateVendorApplication,
  useUploadVendorDocument,
} from '@/lib/queries/auth/mutations';
import type { CreateVendorApplicationRequest } from '@/lib/api/types';

// ─── Steps ──────────────────────────────────────────────────────────────────────

const STEPS = [
  { key: 'personal', label: 'Info', icon: UserAccountIcon },
  { key: 'company', label: 'Company', icon: Building06Icon },
  { key: 'address', label: 'Address', icon: Location01Icon },
  { key: 'bank', label: 'Bank', icon: CreditCardIcon },
  { key: 'documents', label: 'Documents', icon: FileAttachmentIcon },
  { key: 'review', label: 'Review', icon: CheckmarkCircle01Icon },
] as const;

const COMPANY_TYPES = [
  { value: 'Şahıs', label: 'Şahıs Firması' },
  { value: 'Limited', label: 'Limited Şirket (Ltd. Şti.)' },
  { value: 'Anonim', label: 'Anonim Şirket (A.Ş.)' },
];

const CITIES = [
  'Adana', 'Adıyaman', 'Afyonkarahisar', 'Ağrı', 'Aksaray', 'Amasya', 'Ankara', 'Antalya',
  'Ardahan', 'Artvin', 'Aydın', 'Balıkesir', 'Bartın', 'Batman', 'Bayburt', 'Bilecik',
  'Bingöl', 'Bitlis', 'Bolu', 'Burdur', 'Bursa', 'Çanakkale', 'Çankırı', 'Çorum',
  'Denizli', 'Diyarbakır', 'Düzce', 'Edirne', 'Elazığ', 'Erzincan', 'Erzurum', 'Eskişehir',
  'Gaziantep', 'Giresun', 'Gümüşhane', 'Hakkari', 'Hatay', 'Iğdır', 'Isparta', 'İstanbul',
  'İzmir', 'Kahramanmaraş', 'Karabük', 'Karaman', 'Kars', 'Kastamonu', 'Kayseri',
  'Kırıkkale', 'Kırklareli', 'Kırşehir', 'Kilis', 'Kocaeli', 'Konya', 'Kütahya', 'Malatya',
  'Manisa', 'Mardin', 'Mersin', 'Muğla', 'Muş', 'Nevşehir', 'Niğde', 'Ordu', 'Osmaniye',
  'Rize', 'Sakarya', 'Samsun', 'Şanlıurfa', 'Siirt', 'Sinop', 'Sivas', 'Şırnak',
  'Tekirdağ', 'Tokat', 'Trabzon', 'Tunceli', 'Uşak', 'Van', 'Yalova', 'Yozgat', 'Zonguldak',
];

type FormData = CreateVendorApplicationRequest;

const INITIAL_FORM: FormData = {
  firstName: '',
  lastName: '',
  identityNumber: '',
  phone: '',
  companyName: '',
  companyType: '',
  taxNumber: '',
  taxOffice: '',
  street: '',
  district: '',
  city: '',
  postalCode: '',
  iban: '',
  bankName: '',
  about: '',
};

export default function BecomeSellerPage() {
  const { data: profile, isLoading: profileLoading } = useQuery({ ...profileQuery(), retry: false });
  const { data: existingApp, isLoading: appLoading } = useQuery({
    ...vendorApplicationQuery(),
    retry: false,
  });

  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [docs, setDocs] = useState<{ identityDocument?: File; taxDocument?: File; signatureCircular?: File }>({});

  const createApp = useCreateVendorApplication();
  const uploadDoc = useUploadVendorDocument();
  const formRef = useRef<HTMLDivElement>(null);

  const set = (field: keyof FormData, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  };

  // ─── Validation ─────────────────────────────────────────────────────────────

  const validateStep = (s: number): boolean => {
    const errs: Partial<Record<keyof FormData, string>> = {};

    if (s === 0) {
      if (!form.firstName.trim()) errs.firstName = 'Required';
      if (!form.lastName.trim()) errs.lastName = 'Required';
      if (!/^\d{11}$/.test(form.identityNumber)) errs.identityNumber = 'Must be 11 digits';
      if (!form.phone.trim()) errs.phone = 'Required';
    } else if (s === 1) {
      if (!form.companyName.trim()) errs.companyName = 'Required';
      if (!form.companyType) errs.companyType = 'Select a company type';
    } else if (s === 2) {
      if (!form.street.trim()) errs.street = 'Required';
      if (!form.city) errs.city = 'Select a city';
    } else if (s === 3) {
      if (!/^TR\d{24}$/.test(form.iban)) errs.iban = 'Enter a valid Turkish IBAN (TR + 24 digits)';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const next = () => {
    if (step < 4 && !validateStep(step)) return;
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
    formRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const prev = () => {
    setStep((s) => Math.max(s - 1, 0));
    formRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ─── Submit ─────────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    try {
      const result = await createApp.mutateAsync(form);

      // Upload docs if any
      for (const [field, file] of Object.entries(docs)) {
        if (file) {
          await uploadDoc.mutateAsync({ field, file });
        }
      }
    } catch {
      // Error handled by React Query
    }
  };

  // ─── Loading ────────────────────────────────────────────────────────────────

  if (profileLoading || appLoading) {
    return (
      <div className="min-h-screen bg-page flex items-center justify-center">
        <div className="spinner" />
      </div>
    );
  }

  // ─── Not logged in ──────────────────────────────────────────────────────────

  if (!profile) {
    return (
      <div className="min-h-screen bg-page flex items-center justify-center p-4">
        <div className="bg-surface rounded-lg border border-border p-8 max-w-md w-full text-center">
          <Store01Icon size={48} className="text-orange-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-text-primary mb-2">Become a Seller</h1>
          <p className="text-sm text-text-secondary mb-6">
            You need to be logged in to apply as a seller on Saganet.
          </p>
          <div className="flex gap-3 justify-center">
            <Link href="/login" className="btn btn-md btn-primary">
              Sign In
            </Link>
            <Link href="/register" className="btn btn-md btn-secondary">
              Create Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ─── Already a vendor ───────────────────────────────────────────────────────

  if (profile.role === 'VENDOR' || profile.role === 'ADMIN') {
    return (
      <div className="min-h-screen bg-page flex items-center justify-center p-4">
        <div className="bg-surface rounded-lg border border-border p-8 max-w-md w-full text-center">
          <CheckmarkCircle01Icon size={48} className="text-success mx-auto mb-4" />
          <h1 className="text-xl font-bold text-text-primary mb-2">
            {profile.role === 'VENDOR' ? 'You are already a seller!' : 'You are an admin'}
          </h1>
          <p className="text-sm text-text-secondary mb-6">
            {profile.role === 'VENDOR'
              ? 'Your seller account is active. You can start managing your store.'
              : 'Admin accounts already have full access.'}
          </p>
          <Link href="/" className="btn btn-md btn-primary">
            Go to Homepage
          </Link>
        </div>
      </div>
    );
  }

  // ─── Existing application ───────────────────────────────────────────────────

  if (existingApp) {
    return (
      <div className="min-h-screen bg-page flex items-center justify-center p-4">
        <div className="bg-surface rounded-lg border border-border p-8 max-w-lg w-full">
          <div className="text-center mb-6">
            {existingApp.status === 'PENDING' && (
              <>
                <Clock01Icon size={48} className="text-orange-500 mx-auto mb-4" />
                <h1 className="text-xl font-bold text-text-primary mb-2">Application Under Review</h1>
                <p className="text-sm text-text-secondary">
                  Your seller application is being reviewed by our team. We'll notify you once a decision is made.
                </p>
              </>
            )}
            {existingApp.status === 'APPROVED' && (
              <>
                <CheckmarkCircle01Icon size={48} className="text-success mx-auto mb-4" />
                <h1 className="text-xl font-bold text-text-primary mb-2">Application Approved!</h1>
                <p className="text-sm text-text-secondary">
                  Congratulations! Your seller account has been activated.
                </p>
              </>
            )}
            {existingApp.status === 'REJECTED' && (
              <>
                <Cancel01Icon size={48} className="text-error mx-auto mb-4" />
                <h1 className="text-xl font-bold text-text-primary mb-2">Application Rejected</h1>
                <p className="text-sm text-text-secondary">
                  Unfortunately, your application was not approved.
                </p>
                {existingApp.rejectionReason && (
                  <div className="mt-4 bg-error-bg rounded-md p-3 text-sm text-error text-left">
                    <p className="font-semibold mb-1">Reason:</p>
                    <p>{existingApp.rejectionReason}</p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Application Summary */}
          <div className="border-t border-border pt-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-text-muted">Company</span>
              <span className="text-text-primary font-medium">{existingApp.companyName}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-muted">Applicant</span>
              <span className="text-text-primary">{existingApp.firstName} {existingApp.lastName}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-muted">Date</span>
              <span className="text-text-primary">
                {new Date(existingApp.createdAt).toLocaleDateString('tr-TR', {
                  year: 'numeric', month: 'long', day: 'numeric',
                })}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-muted">Status</span>
              <span className={
                existingApp.status === 'PENDING' ? 'badge badge-orange' :
                  existingApp.status === 'APPROVED' ? 'badge badge-green' :
                    'badge badge-red'
              }>
                {existingApp.status}
              </span>
            </div>
          </div>

          <div className="mt-6 text-center">
            <Link href="/" className="btn btn-md btn-ghost">
              Back to Homepage
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ─── Application submitted successfully ─────────────────────────────────────

  if (createApp.isSuccess) {
    return (
      <div className="min-h-screen bg-page flex items-center justify-center p-4">
        <div className="bg-surface rounded-lg border border-border p-8 max-w-md w-full text-center">
          <CheckmarkCircle01Icon size={48} className="text-success mx-auto mb-4" />
          <h1 className="text-xl font-bold text-text-primary mb-2">Application Submitted!</h1>
          <p className="text-sm text-text-secondary mb-6">
            Your seller application has been submitted successfully. Our team will review it and get back to you.
          </p>
          <Link href="/" className="btn btn-md btn-primary">
            Go to Homepage
          </Link>
        </div>
      </div>
    );
  }

  // ─── Application Form ───────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-page">
      {/* Header */}
      <header className="bg-surface border-b border-border">
        <div className="container-page flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-orange-500 flex items-center justify-center">
              <Store01Icon size={18} className="text-white" />
            </div>
            <span className="text-sm font-bold text-text-primary">Saganet</span>
          </Link>
          <span className="text-xs text-text-muted">Seller Application</span>
        </div>
      </header>

      <div className="container-page py-8 max-w-3xl mx-auto">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-text-primary">Become a Seller</h1>
          <p className="text-sm text-text-secondary mt-1">
            Fill in your details below to apply for a seller account
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-1 mb-8">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const isDone = i < step;
            const isCurrent = i === step;
            return (
              <div key={s.key} className="flex items-center">
                <button
                  onClick={() => i <= step && setStep(i)}
                  disabled={i > step}
                  className={`
                    flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium transition-colors
                    ${isCurrent ? 'bg-orange-500 text-white' :
                      isDone ? 'bg-orange-100 text-orange-600' :
                        'bg-neutral-100 text-text-muted'}
                  `}
                >
                  <Icon size={14} />
                  <span className="hidden sm:inline">{s.label}</span>
                </button>
                {i < STEPS.length - 1 && (
                  <div className={`w-4 h-px mx-0.5 ${i < step ? 'bg-orange-300' : 'bg-neutral-200'}`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Form Card */}
        <div ref={formRef} className="bg-surface rounded-lg border border-border p-6 sm:p-8">
          {/* Step 0: Personal */}
          {step === 0 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-semibold text-text-primary mb-1">Personal Information</h2>
                <p className="text-xs text-text-secondary">Your identity information for verification</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="First Name *" error={errors.firstName}>
                  <input className={`input h-10 text-sm ${errors.firstName ? 'input-error' : ''}`} value={form.firstName} onChange={(e) => set('firstName', e.target.value)} placeholder="Yusuf" />
                </Field>
                <Field label="Last Name *" error={errors.lastName}>
                  <input className={`input h-10 text-sm ${errors.lastName ? 'input-error' : ''}`} value={form.lastName} onChange={(e) => set('lastName', e.target.value)} placeholder="Yıldız" />
                </Field>
              </div>

              <Field label="TC Identity Number *" error={errors.identityNumber}>
                <input className={`input h-10 text-sm ${errors.identityNumber ? 'input-error' : ''}`} value={form.identityNumber} onChange={(e) => set('identityNumber', e.target.value.replace(/\D/g, '').slice(0, 11))} placeholder="12345678901" maxLength={11} />
              </Field>

              <Field label="Phone Number *" error={errors.phone}>
                <input className={`input h-10 text-sm ${errors.phone ? 'input-error' : ''}`} value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="+90 555 000 0000" />
              </Field>
            </div>
          )}

          {/* Step 1: Company */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-semibold text-text-primary mb-1">Company Information</h2>
                <p className="text-xs text-text-secondary">Details about your business</p>
              </div>

              <Field label="Company Name *" error={errors.companyName}>
                <input className={`input h-10 text-sm ${errors.companyName ? 'input-error' : ''}`} value={form.companyName} onChange={(e) => set('companyName', e.target.value)} placeholder="Saganet Teknoloji Ltd. Şti." />
              </Field>

              <Field label="Company Type *" error={errors.companyType}>
                <select className={`input h-10 text-sm ${errors.companyType ? 'input-error' : ''}`} value={form.companyType} onChange={(e) => set('companyType', e.target.value)}>
                  <option value="">Select type...</option>
                  {COMPANY_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </Field>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Tax Number">
                  <input className="input h-10 text-sm" value={form.taxNumber} onChange={(e) => set('taxNumber', e.target.value)} placeholder="1234567890" />
                </Field>
                <Field label="Tax Office">
                  <input className="input h-10 text-sm" value={form.taxOffice} onChange={(e) => set('taxOffice', e.target.value)} placeholder="Kadıköy Vergi Dairesi" />
                </Field>
              </div>

              <Field label="About Your Business">
                <textarea className="input h-28 text-sm py-2 resize-none" value={form.about} onChange={(e) => set('about', e.target.value)} placeholder="Tell us about the products you want to sell, your experience, and your goals..." maxLength={2000} />
                <p className="text-[11px] text-text-muted mt-1">{form.about?.length ?? 0}/2000</p>
              </Field>
            </div>
          )}

          {/* Step 2: Address */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-semibold text-text-primary mb-1">Business Address</h2>
                <p className="text-xs text-text-secondary">Your company's registered address</p>
              </div>

              <Field label="Street Address *" error={errors.street}>
                <input className={`input h-10 text-sm ${errors.street ? 'input-error' : ''}`} value={form.street} onChange={(e) => set('street', e.target.value)} placeholder="Atatürk Cad. No:1 Daire:2" />
              </Field>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="District">
                  <input className="input h-10 text-sm" value={form.district} onChange={(e) => set('district', e.target.value)} placeholder="Kadıköy" />
                </Field>
                <Field label="City *" error={errors.city}>
                  <select className={`input h-10 text-sm ${errors.city ? 'input-error' : ''}`} value={form.city} onChange={(e) => set('city', e.target.value)}>
                    <option value="">Select city...</option>
                    {CITIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </Field>
              </div>

              <Field label="Postal Code">
                <input className="input h-10 text-sm" value={form.postalCode} onChange={(e) => set('postalCode', e.target.value)} placeholder="34710" />
              </Field>
            </div>
          )}

          {/* Step 3: Bank */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-semibold text-text-primary mb-1">Bank Account</h2>
                <p className="text-xs text-text-secondary">Your payout account details</p>
              </div>

              <Field label="IBAN *" error={errors.iban}>
                <input className={`input h-10 text-sm font-mono ${errors.iban ? 'input-error' : ''}`} value={form.iban} onChange={(e) => set('iban', e.target.value.toUpperCase().replace(/\s/g, ''))} placeholder="TR330006100519786457841326" maxLength={26} />
              </Field>

              <Field label="Bank Name">
                <input className="input h-10 text-sm" value={form.bankName} onChange={(e) => set('bankName', e.target.value)} placeholder="Ziraat Bankası" />
              </Field>

              <div className="flex items-start gap-2 p-3 bg-info-bg rounded-md">
                <InformationCircleIcon size={16} className="text-info shrink-0 mt-0.5" />
                <p className="text-xs text-info">
                  Your bank account will be used for receiving payments. Make sure the IBAN belongs to the company or the applicant.
                </p>
              </div>
            </div>
          )}

          {/* Step 4: Documents */}
          {step === 4 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-semibold text-text-primary mb-1">Documents</h2>
                <p className="text-xs text-text-secondary">Upload required documents for verification (JPEG, PNG, WebP or PDF, max 10MB)</p>
              </div>

              <DocUpload
                label="Identity Document *"
                hint="Front side of your national ID card or passport"
                file={docs.identityDocument}
                onSelect={(f) => setDocs((d) => ({ ...d, identityDocument: f }))}
              />

              <DocUpload
                label="Tax Certificate"
                hint="Tax registration certificate (Vergi Levhası)"
                file={docs.taxDocument}
                onSelect={(f) => setDocs((d) => ({ ...d, taxDocument: f }))}
              />

              <DocUpload
                label="Signature Circular"
                hint="Company signature circular (İmza Sirküleri)"
                file={docs.signatureCircular}
                onSelect={(f) => setDocs((d) => ({ ...d, signatureCircular: f }))}
              />
            </div>
          )}

          {/* Step 5: Review */}
          {step === 5 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-semibold text-text-primary mb-1">Review Your Application</h2>
                <p className="text-xs text-text-secondary">Please check all details before submitting</p>
              </div>

              <ReviewSection title="Personal">
                <ReviewRow label="Name" value={`${form.firstName} ${form.lastName}`} />
                <ReviewRow label="Identity Number" value={form.identityNumber.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1 $2 $3 $4')} />
                <ReviewRow label="Phone" value={form.phone} />
              </ReviewSection>

              <ReviewSection title="Company">
                <ReviewRow label="Company Name" value={form.companyName} />
                <ReviewRow label="Type" value={form.companyType} />
                {form.taxNumber && <ReviewRow label="Tax Number" value={form.taxNumber} />}
                {form.taxOffice && <ReviewRow label="Tax Office" value={form.taxOffice} />}
                {form.about && <ReviewRow label="About" value={form.about} />}
              </ReviewSection>

              <ReviewSection title="Address">
                <ReviewRow label="Street" value={form.street} />
                {form.district && <ReviewRow label="District" value={form.district} />}
                <ReviewRow label="City" value={form.city} />
                {form.postalCode && <ReviewRow label="Postal Code" value={form.postalCode} />}
              </ReviewSection>

              <ReviewSection title="Bank">
                <ReviewRow label="IBAN" value={form.iban} />
                {form.bankName && <ReviewRow label="Bank" value={form.bankName} />}
              </ReviewSection>

              <ReviewSection title="Documents">
                <ReviewRow label="Identity Document" value={docs.identityDocument ? docs.identityDocument.name : 'Not uploaded'} />
                <ReviewRow label="Tax Certificate" value={docs.taxDocument ? docs.taxDocument.name : 'Not uploaded'} />
                <ReviewRow label="Signature Circular" value={docs.signatureCircular ? docs.signatureCircular.name : 'Not uploaded'} />
              </ReviewSection>

              {createApp.isError && (
                <div className="p-3 bg-error-bg rounded-md text-sm text-error">
                  An error occurred while submitting. Please try again.
                </div>
              )}
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-5 border-t border-border">
            <button
              onClick={prev}
              disabled={step === 0}
              className="btn btn-sm btn-ghost flex items-center gap-1.5 disabled:opacity-30"
            >
              <ArrowLeft01Icon size={16} />
              Back
            </button>

            {step < STEPS.length - 1 ? (
              <button onClick={next} className="btn btn-sm btn-primary flex items-center gap-1.5">
                Next
                <ArrowRight01Icon size={16} />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={createApp.isPending || uploadDoc.isPending}
                className="btn btn-sm btn-primary flex items-center gap-1.5 disabled:opacity-50"
              >
                {createApp.isPending || uploadDoc.isPending ? (
                  <>
                    <span className="spinner !w-4 !h-4 !border-white !border-t-transparent" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckmarkCircle01Icon size={16} />
                    Submit Application
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ─────────────────────────────────────────────────────────────

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="form-group">
      <label className="label">{label}</label>
      {children}
      {error && <p className="field-error">{error}</p>}
    </div>
  );
}

function DocUpload({ label, hint, file, onSelect }: {
  label: string;
  hint: string;
  file?: File;
  onSelect: (f: File) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="border border-border rounded-md p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-text-primary">{label}</p>
          <p className="text-xs text-text-muted mt-0.5">{hint}</p>
        </div>
        <button
          onClick={() => inputRef.current?.click()}
          className="btn btn-sm btn-secondary shrink-0 flex items-center gap-1.5"
        >
          <Upload04Icon size={14} />
          {file ? 'Change' : 'Upload'}
        </button>
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept="image/jpeg,image/png,image/webp,application/pdf"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onSelect(f);
          }}
        />
      </div>
      {file && (
        <div className="mt-2 flex items-center gap-2 text-xs text-success">
          <CheckmarkCircle01Icon size={14} />
          <span className="truncate">{file.name}</span>
          <span className="text-text-muted">({(file.size / 1024 / 1024).toFixed(1)} MB)</span>
        </div>
      )}
    </div>
  );
}

function ReviewSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">{title}</p>
      <div className="bg-neutral-50 rounded-md divide-y divide-border-light">
        {children}
      </div>
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 px-4 py-2.5">
      <span className="text-xs text-text-muted shrink-0">{label}</span>
      <span className="text-sm text-text-primary text-right break-all">{value}</span>
    </div>
  );
}
