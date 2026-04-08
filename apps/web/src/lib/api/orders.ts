import { get, post, qs } from './client';
import type {
  Order, CreateOrderRequest, OrderListQuery, PaginatedResponse,
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

  admin: {
    listAll: (query?: OrderListQuery) =>
      get<PaginatedResponse<Order>>(`${ORDERS}/admin${qs(query as Record<string, unknown>)}`),
  },
};
