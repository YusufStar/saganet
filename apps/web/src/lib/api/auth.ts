import { get, post, patch, del, qs } from './client';
import type {
  LoginRequest, LoginResponse,
  RegisterRequest, RegisterResponse,
  ForgotPasswordRequest, ResetPasswordRequest,
  Profile, UpdateProfileRequest,
  Address, CreateAddressRequest, UpdateAddressRequest,
} from './types';

const AUTH = '/api/auth';
const PROFILE = '/api/auth/profile';
const ADDRESSES = '/api/auth/addresses';

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
};
