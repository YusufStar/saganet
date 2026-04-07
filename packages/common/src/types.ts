export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
}

export interface ApiResponse<T> {
  data: T;
  meta?: PaginationMeta;
  error?: string;
}

export enum ServiceName {
  API_GATEWAY = 'api-gateway',
  AUTH_SERVICE = 'auth-service',
  CATALOG_SERVICE = 'catalog-service',
  INVENTORY_SERVICE = 'inventory-service',
  ORDER_SERVICE = 'order-service',
  PAYMENT_SERVICE = 'payment-service',
  NOTIFICATION_SERVICE = 'notification-service',
}
