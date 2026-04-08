/**
 * Base API client with:
 * - Bearer token injection
 * - Automatic token refresh on 401
 * - Type-safe responses
 * - Server / client rendering compatibility
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

// In-memory token store (client-side). SSR passes token explicitly via headers.
let _accessToken: string | null = null;
let _refreshPromise: Promise<string | null> | null = null;

export const tokenStore = {
  get: () => _accessToken,
  set: (token: string | null) => { _accessToken = token; },
  clear: () => { _accessToken = null; },
};

async function doRefresh(): Promise<string | null> {
  try {
    const res = await fetch(`${API_URL}/api/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    });
    if (!res.ok) {
      tokenStore.clear();
      return null;
    }
    const data = await res.json() as { access_token: string };
    tokenStore.set(data.access_token);
    return data.access_token;
  } catch {
    tokenStore.clear();
    return null;
  }
}

function refreshToken(): Promise<string | null> {
  if (!_refreshPromise) {
    _refreshPromise = doRefresh().finally(() => { _refreshPromise = null; });
  }
  return _refreshPromise;
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly body?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  /** Pass a token explicitly (e.g. from server-side cookies) */
  token?: string;
  /** Disable automatic 401 refresh (used internally to avoid loops) */
  skipRefresh?: boolean;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, token, skipRefresh = false, ...init } = options;

  const bearer = token ?? tokenStore.get();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string> | undefined),
  };
  if (bearer) headers['Authorization'] = `Bearer ${bearer}`;

  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    credentials: 'include',
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401 && !skipRefresh && !token) {
    const newToken = await refreshToken();
    if (newToken) {
      return apiRequest<T>(path, { ...options, token: newToken, skipRefresh: true });
    }
    tokenStore.clear();
    throw new ApiError(401, 'Session expired');
  }

  if (!res.ok) {
    const errorBody = await res.json().catch(() => null);
    const message: string =
      (errorBody as { message?: string })?.message ?? res.statusText;
    throw new ApiError(res.status, message, errorBody);
  }

  // 204 No Content
  if (res.status === 204) return undefined as T;

  return res.json() as Promise<T>;
}

export function get<T>(path: string, opts?: RequestOptions) {
  return apiRequest<T>(path, { ...opts, method: 'GET' });
}

export function post<T>(path: string, body?: unknown, opts?: RequestOptions) {
  return apiRequest<T>(path, { ...opts, method: 'POST', body });
}

export function patch<T>(path: string, body?: unknown, opts?: RequestOptions) {
  return apiRequest<T>(path, { ...opts, method: 'PATCH', body });
}

export function put<T>(path: string, body?: unknown, opts?: RequestOptions) {
  return apiRequest<T>(path, { ...opts, method: 'PUT', body });
}

export function del<T>(path: string, opts?: RequestOptions) {
  return apiRequest<T>(path, { ...opts, method: 'DELETE' });
}

/** Build a query string from a plain object, omitting undefined/null values */
export function qs(params?: Record<string, unknown>): string {
  if (!params) return '';
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== '') p.set(k, String(v));
  }
  const str = p.toString();
  return str ? `?${str}` : '';
}
