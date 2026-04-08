import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from '@/lib/api/auth';
import type {
  LoginRequest, RegisterRequest,
  ForgotPasswordRequest, ResetPasswordRequest,
  UpdateProfileRequest, CreateAddressRequest, UpdateAddressRequest,
  UpdateUserRoleRequest,
} from '@/lib/api/types';
import { authKeys } from './query-keys';

export function useLogin() {
  return useMutation({
    // auth-service sets sat + session_id + refresh_token cookies via Set-Cookie
    mutationFn: (body: LoginRequest) => authApi.login(body),
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: (body: RegisterRequest) => authApi.register(body),
  });
}

export function useLogout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => authApi.logout(),
    onSettled: () => {
      // auth-service clears all cookies (sat, session_id, refresh_token) on logout
      qc.clear();
    },
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (body: ForgotPasswordRequest) => authApi.forgotPassword(body),
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (body: ResetPasswordRequest) => authApi.resetPassword(body),
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateProfileRequest) => authApi.updateProfile(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: authKeys.profile() }),
  });
}

export function useCreateAddress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateAddressRequest) => authApi.createAddress(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: authKeys.addresses() }),
  });
}

export function useUpdateAddress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateAddressRequest }) =>
      authApi.updateAddress(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: authKeys.addresses() }),
  });
}

export function useDeleteAddress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => authApi.deleteAddress(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: authKeys.addresses() }),
  });
}

export function useSetDefaultAddress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => authApi.setDefaultAddress(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: authKeys.addresses() }),
  });
}

// ─── Admin: User Management ─────────────────────────────────────────────────

export function useUpdateUserRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateUserRoleRequest }) =>
      authApi.admin.updateUserRole(id, body),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: authKeys.adminUser(id) });
      qc.invalidateQueries({ queryKey: authKeys.adminUsers() });
    },
  });
}

export function useBanUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      authApi.admin.banUser(id, reason),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: authKeys.adminUser(id) });
      qc.invalidateQueries({ queryKey: authKeys.adminUsers() });
    },
  });
}

export function useUnbanUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => authApi.admin.unbanUser(id),
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: authKeys.adminUser(id) });
      qc.invalidateQueries({ queryKey: authKeys.adminUsers() });
    },
  });
}
