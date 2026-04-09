import { get, post, patch, del, qs } from './client';
import type {
  LoginRequest, LoginResponse,
  RegisterRequest, RegisterResponse,
  ForgotPasswordRequest, ResetPasswordRequest,
  Profile, UpdateProfileRequest,
  Address, CreateAddressRequest, UpdateAddressRequest,
  AdminUser, AdminUserListQuery, UpdateUserRoleRequest, PaginatedResponse,
  VendorApplication, CreateVendorApplicationRequest,
  VendorApplicationListQuery, RejectVendorApplicationRequest,
} from './types';

const AUTH = '/api/auth';
const PROFILE = '/api/auth/profile';
const ADDRESSES = '/api/auth/addresses';
const VENDOR_APP = '/api/auth/vendor-application';
const ADMIN_VENDOR_APPS = '/api/auth/admin/vendor-applications';

// ─── Auth endpoints ───────────────────────────────────────────────────────────

export const authApi = {
  register: (body: RegisterRequest) =>
    post<RegisterResponse>(`${AUTH}/register`, body, { skipRefresh: true }),

  login: (body: LoginRequest) =>
    post<LoginResponse>(`${AUTH}/login`, body, { skipRefresh: true }),

  logout: () =>
    post<void>(`${AUTH}/logout`),

  refresh: () =>
    post<void>(`${AUTH}/refresh`),

  verifyEmail: (token: string) =>
    get<{ message: string }>(`${AUTH}/verify-email${qs({ token })}`),

  forgotPassword: (body: ForgotPasswordRequest) =>
    post<{ message: string }>(`${AUTH}/forgot-password`, body),

  resetPassword: (body: ResetPasswordRequest) =>
    post<{ message: string }>(`${AUTH}/reset-password`, body),

  // ─── Profile ───────────────────────────────────────────────────────────────

  getProfile: () =>
    get<Profile>(PROFILE),

  updateProfile: (body: UpdateProfileRequest) =>
    patch<Profile>(PROFILE, body),

  // ─── Addresses ─────────────────────────────────────────────────────────────

  listAddresses: () =>
    get<Address[]>(ADDRESSES),

  createAddress: (body: CreateAddressRequest) =>
    post<Address>(ADDRESSES, body),

  updateAddress: (id: string, body: UpdateAddressRequest) =>
    patch<Address>(`${ADDRESSES}/${id}`, body),

  deleteAddress: (id: string) =>
    del<void>(`${ADDRESSES}/${id}`),

  setDefaultAddress: (id: string) =>
    patch<Address>(`${ADDRESSES}/${id}/default`),

  // ─── Vendor Application ────────────────────────────────────────────────────

  vendorApplication: {
    create: (body: CreateVendorApplicationRequest) =>
      post<VendorApplication>(VENDOR_APP, body),

    getOwn: () =>
      get<VendorApplication | null>(VENDOR_APP),

    uploadDocument: (field: string, file: File) => {
      const form = new FormData();
      form.append('file', file);
      return fetch(
        `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000'}${VENDOR_APP}/documents/${field}`,
        { method: 'POST', credentials: 'include', body: form },
      ).then((r) => r.json() as Promise<VendorApplication>);
    },
  },

  // ─── Admin: User Management ────────────────────────────────────────────────

  admin: {
    listUsers: (query?: AdminUserListQuery) =>
      get<PaginatedResponse<AdminUser>>(`${AUTH}/admin/users${qs(query as Record<string, unknown>)}`),

    getUser: (id: string) =>
      get<AdminUser>(`${AUTH}/admin/users/${id}`),

    updateUserRole: (id: string, body: UpdateUserRoleRequest) =>
      patch<AdminUser>(`${AUTH}/admin/users/${id}/role`, body),

    banUser: (id: string, reason?: string) =>
      post<void>(`${AUTH}/admin/users/${id}/ban`, reason ? { reason } : undefined),

    unbanUser: (id: string) =>
      post<void>(`${AUTH}/admin/users/${id}/unban`),

    // Vendor Applications
    listVendorApplications: (query?: VendorApplicationListQuery) =>
      get<PaginatedResponse<VendorApplication>>(`${ADMIN_VENDOR_APPS}${qs(query as Record<string, unknown>)}`),

    getVendorApplication: (id: string) =>
      get<VendorApplication>(`${ADMIN_VENDOR_APPS}/${id}`),

    approveVendorApplication: (id: string) =>
      patch<VendorApplication>(`${ADMIN_VENDOR_APPS}/${id}/approve`),

    rejectVendorApplication: (id: string, body?: RejectVendorApplicationRequest) =>
      patch<VendorApplication>(`${ADMIN_VENDOR_APPS}/${id}/reject`, body),
  },
};
