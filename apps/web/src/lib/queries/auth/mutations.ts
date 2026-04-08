import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from '@/lib/api/auth';
import { tokenStore } from '@/lib/api/client';
import type {
  LoginRequest, RegisterRequest,
  ForgotPasswordRequest, ResetPasswordRequest,
  UpdateProfileRequest, CreateAddressRequest, UpdateAddressRequest,
} from '@/lib/api/types';
import { authKeys } from './query-keys';

export function useLogin() {
  return useMutation({
    mutationFn: (body: LoginRequest) => authApi.login(body),
    onSuccess: (data) => {
      tokenStore.set(data.access_token);
    },
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
      tokenStore.clear();
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
