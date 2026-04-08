import { queryOptions } from '@tanstack/react-query';
import { catalogApi } from '@/lib/api/catalog';
import type { ProductListQuery } from '@/lib/api/types';
import { catalogKeys } from './query-keys';

export const productListQuery = (query?: ProductListQuery) =>
  queryOptions({
    queryKey: catalogKeys.productList(query),
    queryFn: () => catalogApi.listProducts(query),
  });

export const productQuery = (idOrSlug: string) =>
  queryOptions({
    queryKey: catalogKeys.product(idOrSlug),
    queryFn: () => catalogApi.getProduct(idOrSlug),
    enabled: !!idOrSlug,
  });

export const categoriesQuery = () =>
  queryOptions({
    queryKey: catalogKeys.categories(),
    queryFn: () => catalogApi.listCategories(),
    staleTime: 5 * 60 * 1000, // categories rarely change
  });

export const categoryQuery = (idOrSlug: string) =>
  queryOptions({
    queryKey: catalogKeys.category(idOrSlug),
    queryFn: () => catalogApi.getCategory(idOrSlug),
    enabled: !!idOrSlug,
  });

export const vendorProductListQuery = (query?: ProductListQuery) =>
  queryOptions({
    queryKey: catalogKeys.vendorProducts(query),
    queryFn: () => catalogApi.vendor.listMyProducts(query),
  });

export const adminProductListQuery = (query?: ProductListQuery) =>
  queryOptions({
    queryKey: catalogKeys.adminProducts(query),
    queryFn: () => catalogApi.admin.listProducts(query),
  });
