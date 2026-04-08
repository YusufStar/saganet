import { NextRequest, NextResponse } from 'next/server';
import { TOKEN_COOKIE, decodeToken, isTokenExpired } from '@/lib/auth/decode';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

// Pages that require a specific role
const VENDOR_PREFIX = '/store';
const ADMIN_PREFIX = '/admin';

// Pages that require any authenticated user
const AUTH_REQUIRED = ['/profile', '/orders', '/addresses', '/favorites', '/cart', '/checkout'];

// Pages that should redirect to / if already authenticated
const AUTH_ONLY_PAGES = ['/login', '/register'];

interface AuthResult {
  authenticated: boolean;
  role?: string;
  newToken?: string;
}

async function resolveAuth(req: NextRequest): Promise<AuthResult> {
  const sat = req.cookies.get(TOKEN_COOKIE)?.value;

  // 1. Valid token in cookie → decode and use
  if (sat) {
    const payload = decodeToken(sat);
    if (payload && !isTokenExpired(payload)) {
      return { authenticated: true, role: payload.role };
    }
  }

  // 2. Token missing or expired → try refresh (uses httpOnly session cookie)
  try {
    const res = await fetch(`${API_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: { cookie: req.headers.get('cookie') ?? '' },
    });
    if (res.ok) {
      const data = await res.json() as { access_token: string };
      const payload = decodeToken(data.access_token);
      return { authenticated: true, role: payload?.role, newToken: data.access_token };
    }
  } catch {
    // Refresh endpoint unreachable — treat as unauthenticated
  }

  return { authenticated: false };
}

function withUpdatedToken(res: NextResponse, token: string): NextResponse {
  res.cookies.set(TOKEN_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24,
  });
  return res;
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isAuthPage = AUTH_ONLY_PAGES.some((p) => pathname.startsWith(p));
  const isVendorPage = pathname.startsWith(VENDOR_PREFIX);
  const isAdminPage = pathname.startsWith(ADMIN_PREFIX);
  const isProtectedPage = AUTH_REQUIRED.some((p) => pathname.startsWith(p));

  // Fast path: public pages that don't need auth checks
  if (!isAuthPage && !isVendorPage && !isAdminPage && !isProtectedPage) {
    return NextResponse.next();
  }

  const auth = await resolveAuth(req);

  // Auth pages: redirect home if already logged in
  if (isAuthPage) {
    if (auth.authenticated) {
      return NextResponse.redirect(new URL('/', req.url));
    }
    return NextResponse.next();
  }

  // Protected pages: redirect to login if not authenticated
  if (!auth.authenticated) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Role-based guards
  if (isAdminPage && auth.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/', req.url));
  }
  if (isVendorPage && auth.role !== 'VENDOR' && auth.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/', req.url));
  }

  // Allow through — refresh token if we got a new one
  const res = NextResponse.next();
  if (auth.newToken) withUpdatedToken(res, auth.newToken);
  return res;
}

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    '/((?!_next/static|_next/image|favicon.ico|api/).*)',
  ],
};
