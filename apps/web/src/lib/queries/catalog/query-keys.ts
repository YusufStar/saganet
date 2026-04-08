import type { ProductListQuery } from '@/lib/api/types';

export const catalogKeys = {
  all: ['catalog'] as const,
  products: () => [...catalogKeys.all, 'products'] as const,
  productList: (query?: ProductListQuery) => [...catalogKeys.products(), 'list', query ?? {}] as const,
  product: (idOrSlug: string) => [...catalogKeys.products(), idOrSlug] as const,
  categories: () => [...catalogKeys.all, 'categories'] as const,
  category: (idOrSlug: string) => [...catalogKeys.categories(), idOrSlug] as const,
  vendorProducts: (query?: ProductListQuery) => [...catalogKeys.all, 'vendor', 'products', query ?? {}] as const,
  adminProducts: (query?: ProductListQuery) => [...catalogKeys.all, 'admin', 'products', query ?? {}] as const,
};
