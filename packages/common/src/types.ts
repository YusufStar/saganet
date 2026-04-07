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

// Cursor-based pagination
export interface CursorPaginationMeta {
  nextCursor: string | null;
  prevCursor: string | null;
  hasNext: boolean;
  hasPrev: boolean;
  limit: number;
}

// Error codes enum
export enum ErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  INSUFFICIENT_STOCK = 'INSUFFICIENT_STOCK',
  IDEMPOTENCY_CONFLICT = 'IDEMPOTENCY_CONFLICT',
}
