// ─── Shared ──────────────────────────────────────────────────────────────────

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export type UserRole = 'ADMIN' | 'VENDOR' | 'CUSTOMER';

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: AuthUser;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface RegisterResponse {
  user: AuthUser;
  message: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

// ─── Profile & Address ────────────────────────────────────────────────────────

export interface Profile {
  id: string;
  email: string;
  role: UserRole;
  displayName?: string;
  emailVerified: boolean;
  createdAt: string;
}

export interface UpdateProfileRequest {
  displayName?: string;
}

export interface Address {
  id: string;
  label?: string;
  fullName: string;
  phone?: string;
  street: string;
  district?: string;
  city: string;
  postalCode?: string;
  country: string;
  isDefault: boolean;
}

export interface CreateAddressRequest {
  label?: string;
  fullName: string;
  phone?: string;
  street: string;
  district?: string;
  city: string;
  postalCode?: string;
  country?: string;
  isDefault?: boolean;
}

export type UpdateAddressRequest = Partial<CreateAddressRequest>;

// ─── Catalog ──────────────────────────────────────────────────────────────────

export interface ProductImage {
  id: string;
  url: string;
  order: number;
}

export interface Product {
  id: string;
  vendorId: string;
  name: string;
  description?: string;
  slug: string;
  price: string;
  categoryId: string;
  images: ProductImage[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductListQuery {
  page?: number;
  limit?: number;
  categoryId?: string;
  minPrice?: string;
  maxPrice?: string;
  search?: string;
  sortBy?: 'price' | 'createdAt' | 'name';
  sortOrder?: 'ASC' | 'DESC';
  cursor?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  parentId?: string;
  children: Category[];
}

export interface CreateProductRequest {
  name: string;
  description?: string;
  price: string;
  categoryId: string;
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {}

// ─── Inventory ────────────────────────────────────────────────────────────────

export interface InventoryItem {
  productId: string;
  quantity: number;
  reservedQuantity: number;
  updatedAt: string;
}

export interface StockResponse {
  productId: string;
  available: number;
}

export interface UpsertInventoryRequest {
  productId: string;
  quantity: number;
}

export interface AdjustInventoryRequest {
  delta: number;
  reason?: string;
}

// ─── Orders ───────────────────────────────────────────────────────────────────

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'FAILED' | 'CANCELLED' | 'COMPLETED';

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: string;
}

export interface AddressSnapshot {
  fullName: string;
  phone: string;
  street: string;
  district?: string;
  city: string;
  postalCode?: string;
  country: string;
}

export interface Order {
  id: string;
  userId: string;
  status: OrderStatus;
  totalAmount: string;
  addressSnapshot: AddressSnapshot;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: string;
}

export interface CreateOrderRequest {
  items: CreateOrderItem[];
  address: AddressSnapshot;
}

export interface OrderListQuery {
  page?: number;
  limit?: number;
  status?: OrderStatus;
}

// ─── Payments ─────────────────────────────────────────────────────────────────

export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';

export interface Payment {
  id: string;
  orderId: string;
  userId: string;
  amount: string;
  currency: string;
  status: PaymentStatus;
  provider: string;
  createdAt: string;
}

// ─── Reviews ──────────────────────────────────────────────────────────────────

export interface Review {
  id: string;
  productId: string;
  userId: string;
  orderId: string;
  rating: number;
  comment?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewStats {
  avgRating: number;
  reviewCount: number;
  distribution: Record<number, number>;
}

export interface ReviewListResponse {
  data: Review[];
  meta: PaginationMeta;
  stats: ReviewStats;
}

export interface CreateReviewRequest {
  rating: number;
  comment?: string;
  orderId: string;
}

export interface UpdateReviewRequest {
  rating?: number;
  comment?: string;
}

// ─── Notifications ────────────────────────────────────────────────────────────

export interface Notification {
  id: string;
  userId: string;
  type: string;
  subject: string;
  status: 'PENDING' | 'SENT' | 'FAILED';
  createdAt: string;
}

export interface NotificationListQuery {
  page?: number;
  limit?: number;
}

// ─── Admin: Users ────────────────────────────────────────────────────────────

export interface AdminUser {
  id: string;
  email: string;
  role: UserRole;
  displayName?: string;
  emailVerified: boolean;
  isBanned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminUserListQuery {
  page?: number;
  limit?: number;
  role?: UserRole;
  search?: string;
  sortBy?: 'email' | 'createdAt' | 'role';
  sortOrder?: 'ASC' | 'DESC';
}

export interface UpdateUserRoleRequest {
  role: UserRole;
}

// ─── Admin: Products ─────────────────────────────────────────────────────────

export type ProductStatus = 'PENDING_REVIEW' | 'ACTIVE' | 'REJECTED' | 'SUSPENDED';

export interface AdminProduct extends Product {
  status: ProductStatus;
  rejectionReason?: string;
}

export interface AdminProductListQuery {
  page?: number;
  limit?: number;
  status?: ProductStatus;
  vendorId?: string;
  search?: string;
  sortBy?: 'price' | 'createdAt' | 'name';
  sortOrder?: 'ASC' | 'DESC';
}

// ─── Admin: Orders ───────────────────────────────────────────────────────────

export interface AdminOrderListQuery extends OrderListQuery {
  userId?: string;
  sortBy?: 'createdAt' | 'totalAmount' | 'status';
  sortOrder?: 'ASC' | 'DESC';
}

export interface UpdateOrderStatusRequest {
  status: OrderStatus;
  reason?: string;
}

// ─── Admin: Payments ─────────────────────────────────────────────────────────

export interface AdminPaymentListQuery {
  page?: number;
  limit?: number;
  status?: PaymentStatus;
  userId?: string;
  orderId?: string;
}

export interface RefundPaymentRequest {
  reason?: string;
}

// ─── Admin: Gateway Health ───────────────────────────────────────────────────

export interface GatewayHealth {
  status: string;
  info?: Record<string, { status: string }>;
}
