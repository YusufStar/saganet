import { get, post, patch, qs } from './client';
import type {
  Order, CreateOrderRequest, OrderListQuery, AdminOrderListQuery,
  UpdateOrderStatusRequest, PaginatedResponse,
} from './types';

const ORDERS = '/api/orders';

export const ordersApi = {
  create: (body: CreateOrderRequest) =>
    post<Order>(ORDERS, body),

  list: (query?: OrderListQuery) =>
    get<PaginatedResponse<Order>>(`${ORDERS}${qs(query as Record<string, unknown>)}`),

  get: (id: string) =>
    get<Order>(`${ORDERS}/${id}`),

  cancel: (id: string) =>
    post<Order>(`${ORDERS}/${id}/cancel`),

  // ─── Admin ────────────────────────────────────────────────────────────────
  // Backend uses the same endpoints — ADMIN role sees all orders automatically.

  admin: {
    listAll: (query?: AdminOrderListQuery) =>
      get<PaginatedResponse<Order>>(`${ORDERS}${qs(query as Record<string, unknown>)}`),

    getOrder: (id: string) =>
      get<Order>(`${ORDERS}/${id}`),

    updateStatus: (id: string, body: UpdateOrderStatusRequest) =>
      patch<Order>(`${ORDERS}/${id}/status`, body),
  },
};
