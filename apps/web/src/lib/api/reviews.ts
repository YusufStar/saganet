import { get, post, patch, del, qs } from './client';
import type {
  Review, ReviewListResponse, ReviewStats,
  CreateReviewRequest, UpdateReviewRequest,
} from './types';

const CATALOG = '/api/catalog';

export const reviewsApi = {
  listByProduct: (productId: string, query?: { page?: number; limit?: number }) =>
    get<ReviewListResponse>(`${CATALOG}/products/${productId}/reviews${qs(query as Record<string, unknown>)}`),

  getStats: (productId: string) =>
    get<ReviewStats>(`${CATALOG}/products/${productId}/reviews/stats`),

  create: (productId: string, body: CreateReviewRequest) =>
    post<Review>(`${CATALOG}/products/${productId}/reviews`, body),

  update: (reviewId: string, body: UpdateReviewRequest) =>
    patch<Review>(`${CATALOG}/reviews/${reviewId}`, body),

  remove: (reviewId: string) =>
    del<void>(`${CATALOG}/reviews/${reviewId}`),
};
