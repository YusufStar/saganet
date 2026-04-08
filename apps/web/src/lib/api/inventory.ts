import { get, post, patch, qs } from './client';
import type {
  InventoryItem, StockResponse,
  UpsertInventoryRequest, AdjustInventoryRequest,
} from './types';

const INV = '/api/inventory';

export const inventoryApi = {
  // ─── Public ───────────────────────────────────────────────────────────────

  getStock: (productId: string) =>
    get<StockResponse>(`${INV}/stock/${productId}`),

  batchGetStock: (productIds: string[]) =>
    get<StockResponse[]>(`${INV}/stock${qs({ ids: productIds.join(',') })}`),

  // ─── Vendor / Admin ───────────────────────────────────────────────────────

  getInventory: (productId: string) =>
    get<InventoryItem>(`${INV}/inventory/${productId}`),

  upsertInventory: (body: UpsertInventoryRequest) =>
    post<InventoryItem>(`${INV}/inventory`, body),

  adjustInventory: (productId: string, body: AdjustInventoryRequest) =>
    patch<InventoryItem>(`${INV}/inventory/${productId}/adjust`, body),
};
