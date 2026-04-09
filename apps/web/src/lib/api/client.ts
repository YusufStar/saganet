/**
 * Fully cookie-based API client.
 * - No Bearer token / tokenStore — auth goes through httpOnly cookies (sat, session_id, refresh_token)
 * - On 401: calls refresh endpoint → auth-service rotates cookies via Set-Cookie → retries
 * - credentials: 'include' ensures cookies are sent on every request
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

let _refreshPromise: Promise<boolean> | null = null;

async function doRefresh(): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/api/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    });
    return res.ok;
    // auth-service sets new sat + refresh_token cookies via Set-Cookie automatically
  } catch {
    return false;
  }
}

function refreshOnce(): Promise<boolean> {
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
  /** Disable automatic 401 refresh (used internally to avoid loops) */
  skipRefresh?: boolean;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, skipRefresh = false, ...init } = options;

  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers as Record<string, string> | undefined),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401 && !skipRefresh) {
    const refreshed = await refreshOnce();
    if (refreshed) {
      // Retry with new sat cookie (browser sends it automatically via credentials: 'include')
      return apiRequest<T>(path, { ...options, skipRefresh: true });
    }
    throw new ApiError(401, 'Session expired');
  }

  if (!res.ok) {
    const errorBody = await res.json().catch(() => null);
    const message: string =
      (errorBody as { message?: string })?.message ?? res.statusText;
    throw new ApiError(res.status, message, errorBody);
  }

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

/**
 * Proactive token refresh — fires every 60 s in the browser.
 * Keeps sat fresh so the Next.js proxy never sees an expired token.
 * Silent: 401 (not logged in) is simply ignored.
 */
if (typeof window !== 'undefined') {
  // Immediate refresh on first load — ensures sat cookie is fresh from the start
  fetch(`${API_URL}/api/auth/refresh`, { method: 'POST', credentials: 'include' })
    .catch(() => { /* not logged in — ignored */ });

  setInterval(() => {
    fetch(`${API_URL}/api/auth/refresh`, { method: 'POST', credentials: 'include' })
      .catch(() => { /* not logged in or network error — reactive refresh handles 401s */ });
  }, 60_000);
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
