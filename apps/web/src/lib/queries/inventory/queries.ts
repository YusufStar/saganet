import { queryOptions } from '@tanstack/react-query';
import { inventoryApi } from '@/lib/api/inventory';
import { inventoryKeys } from './query-keys';

export const stockQuery = (productId: string) =>
  queryOptions({
    queryKey: inventoryKeys.stock(productId),
    queryFn: () => inventoryApi.getStock(productId),
    enabled: !!productId,
    staleTime: 30 * 1000,
  });

export const batchStockQuery = (productIds: string[]) =>
  queryOptions({
    queryKey: inventoryKeys.batchStock(productIds),
    queryFn: () => inventoryApi.batchGetStock(productIds),
    enabled: productIds.length > 0,
    staleTime: 30 * 1000,
  });

export const inventoryItemQuery = (productId: string) =>
  queryOptions({
    queryKey: inventoryKeys.item(productId),
    queryFn: () => inventoryApi.getInventory(productId),
    enabled: !!productId,
  });
