import { useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryApi } from '@/lib/api/inventory';
import type { UpsertInventoryRequest, AdjustInventoryRequest } from '@/lib/api/types';
import { inventoryKeys } from './query-keys';

export function useUpsertInventory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: UpsertInventoryRequest) => inventoryApi.upsertInventory(body),
    onSuccess: (_data, { productId }) => {
      qc.invalidateQueries({ queryKey: inventoryKeys.item(productId) });
      qc.invalidateQueries({ queryKey: inventoryKeys.stock(productId) });
    },
  });
}

export function useAdjustInventory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, body }: { productId: string; body: AdjustInventoryRequest }) =>
      inventoryApi.adjustInventory(productId, body),
    onSuccess: (_data, { productId }) => {
      qc.invalidateQueries({ queryKey: inventoryKeys.item(productId) });
      qc.invalidateQueries({ queryKey: inventoryKeys.stock(productId) });
    },
  });
}
