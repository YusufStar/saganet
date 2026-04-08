import { useMutation, useQueryClient } from '@tanstack/react-query';
import { catalogApi } from '@/lib/api/catalog';
import type { CreateProductRequest, UpdateProductRequest } from '@/lib/api/types';
import { catalogKeys } from './query-keys';

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateProductRequest) => catalogApi.vendor.createProduct(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: catalogKeys.vendorProducts() }),
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateProductRequest }) =>
      catalogApi.vendor.updateProduct(id, body),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: catalogKeys.product(id) });
      qc.invalidateQueries({ queryKey: catalogKeys.vendorProducts() });
    },
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => catalogApi.vendor.deleteProduct(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: catalogKeys.vendorProducts() }),
  });
}

export function useUploadProductImage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, file }: { productId: string; file: File }) =>
      catalogApi.vendor.uploadImage(productId, file),
    onSuccess: (_data, { productId }) => {
      qc.invalidateQueries({ queryKey: catalogKeys.product(productId) });
    },
  });
}

export function useApproveProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => catalogApi.admin.approveProduct(id),
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: catalogKeys.product(id) });
      qc.invalidateQueries({ queryKey: catalogKeys.adminProducts() });
    },
  });
}

export function useRejectProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      catalogApi.admin.rejectProduct(id, reason),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: catalogKeys.product(id) });
      qc.invalidateQueries({ queryKey: catalogKeys.adminProducts() });
    },
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { name: string; parentId?: string }) =>
      catalogApi.admin.createCategory(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: catalogKeys.categories() }),
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => catalogApi.admin.deleteCategory(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: catalogKeys.categories() }),
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: { name?: string; parentId?: string } }) =>
      catalogApi.admin.updateCategory(id, body),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: catalogKeys.category(id) });
      qc.invalidateQueries({ queryKey: catalogKeys.categories() });
    },
  });
}

export function useUpdateAdminProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateProductRequest }) =>
      catalogApi.admin.updateProduct(id, body),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: catalogKeys.product(id) });
      qc.invalidateQueries({ queryKey: catalogKeys.adminProducts() });
    },
  });
}
