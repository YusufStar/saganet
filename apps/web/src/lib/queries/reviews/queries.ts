import { queryOptions } from '@tanstack/react-query';
import { reviewsApi } from '@/lib/api/reviews';
import { reviewKeys } from './query-keys';

export const productReviewsQuery = (productId: string, query?: { page?: number; limit?: number }) =>
  queryOptions({
    queryKey: reviewKeys.byProduct(productId, query),
    queryFn: () => reviewsApi.listByProduct(productId, query),
    enabled: !!productId,
  });

export const reviewStatsQuery = (productId: string) =>
  queryOptions({
    queryKey: reviewKeys.stats(productId),
    queryFn: () => reviewsApi.getStats(productId),
    enabled: !!productId,
  });
