export const inventoryKeys = {
  all: ['inventory'] as const,
  stock: (productId: string) => [...inventoryKeys.all, 'stock', productId] as const,
  batchStock: (ids: string[]) => [...inventoryKeys.all, 'stock', 'batch', ids] as const,
  item: (productId: string) => [...inventoryKeys.all, 'item', productId] as const,
};
