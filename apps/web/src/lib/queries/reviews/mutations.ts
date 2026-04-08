import { useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewsApi } from '@/lib/api/reviews';
import type { CreateReviewRequest, UpdateReviewRequest } from '@/lib/api/types';
import { reviewKeys } from './query-keys';

export function useCreateReview(productId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateReviewRequest) => reviewsApi.create(productId, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: reviewKeys.byProduct(productId) });
      qc.invalidateQueries({ queryKey: reviewKeys.stats(productId) });
    },
  });
}

export function useUpdateReview(productId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateReviewRequest }) =>
      reviewsApi.update(id, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: reviewKeys.byProduct(productId) });
      qc.invalidateQueries({ queryKey: reviewKeys.stats(productId) });
    },
  });
}

export function useDeleteReview(productId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => reviewsApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: reviewKeys.byProduct(productId) });
      qc.invalidateQueries({ queryKey: reviewKeys.stats(productId) });
    },
  });
}
