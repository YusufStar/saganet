export const reviewKeys = {
  all: ['reviews'] as const,
  byProduct: (productId: string, query?: { page?: number; limit?: number }) =>
    [...reviewKeys.all, 'product', productId, query ?? {}] as const,
  stats: (productId: string) => [...reviewKeys.all, 'stats', productId] as const,
};
