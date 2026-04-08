import { get, post, patch, del, qs } from './client';
import type {
  Product, ProductListQuery, PaginatedResponse,
  Category,
  CreateProductRequest, UpdateProductRequest,
} from './types';

const CATALOG = '/api/catalog';

export const catalogApi = {
  // ─── Products (public) ────────────────────────────────────────────────────

  listProducts: (query?: ProductListQuery) =>
    get<PaginatedResponse<Product>>(`${CATALOG}/products${qs(query as Record<string, unknown>)}`),

  getProduct: (idOrSlug: string) =>
    get<Product>(`${CATALOG}/products/${idOrSlug}`),

  // ─── Categories (public) ──────────────────────────────────────────────────

  listCategories: () =>
    get<Category[]>(`${CATALOG}/categories`),

  getCategory: (idOrSlug: string) =>
    get<Category>(`${CATALOG}/categories/${idOrSlug}`),

  // ─── Vendor: own products ─────────────────────────────────────────────────

  vendor: {
    listMyProducts: (query?: ProductListQuery) =>
      get<PaginatedResponse<Product>>(`${CATALOG}/vendor/products${qs(query as Record<string, unknown>)}`),

    createProduct: (body: CreateProductRequest) =>
      post<Product>(`${CATALOG}/vendor/products`, body),

    updateProduct: (id: string, body: UpdateProductRequest) =>
      patch<Product>(`${CATALOG}/vendor/products/${id}`, body),

    deleteProduct: (id: string) =>
      del<void>(`${CATALOG}/vendor/products/${id}`),

    uploadImage: (productId: string, file: File) => {
      const form = new FormData();
      form.append('file', file);
      return fetch(
        `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000'}${CATALOG}/vendor/products/${productId}/images`,
        { method: 'POST', credentials: 'include', body: form },
      ).then((r) => r.json() as Promise<Product>);
    },
  },

  // ─── Admin ────────────────────────────────────────────────────────────────

  admin: {
    listProducts: (query?: ProductListQuery) =>
      get<PaginatedResponse<Product>>(`${CATALOG}/admin/products${qs(query as Record<string, unknown>)}`),

    approveProduct: (id: string) =>
      post<Product>(`${CATALOG}/admin/products/${id}/approve`),

    rejectProduct: (id: string, reason?: string) =>
      post<Product>(`${CATALOG}/admin/products/${id}/reject`, { reason }),

    updateProduct: (id: string, body: UpdateProductRequest) =>
      patch<Product>(`${CATALOG}/admin/products/${id}`, body),

    createCategory: (body: { name: string; parentId?: string }) =>
      post<Category>(`${CATALOG}/admin/categories`, body),

    updateCategory: (id: string, body: { name?: string; parentId?: string }) =>
      patch<Category>(`${CATALOG}/admin/categories/${id}`, body),

    deleteCategory: (id: string) =>
      del<void>(`${CATALOG}/admin/categories/${id}`),
  },
};
