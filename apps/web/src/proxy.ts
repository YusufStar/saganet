import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

// Pages that require a specific role
const VENDOR_PREFIX = '/store';
const ADMIN_PREFIX = '/admin';

// Pages that require any authenticated user
const AUTH_REQUIRED = ['/profile', '/orders', '/addresses', '/favorites', '/cart', '/checkout'];

// Pages that should redirect to / if already authenticated
const AUTH_ONLY_PAGES = ['/login', '/register', '/forgot-password', '/reset-password', '/verify-email'];

/**
 * Calls /api/auth/profile with the browser's cookies forwarded.
 * Returns the role string if authenticated, null otherwise.
 * The api-gateway is the single source of truth — no JWT decoding needed here.
 */
async function getRole(req: NextRequest): Promise<string | null> {
  try {
    const res = await fetch(`${API_URL}/api/auth/profile`, {
      method: 'GET',
      headers: { cookie: req.headers.get('cookie') ?? '' },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const data = await res.json() as { role?: string };
    return data.role ?? null;
  } catch {
    return null;
  }
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isAuthPage = AUTH_ONLY_PAGES.some((p) => pathname.startsWith(p));
  const isVendorPage = pathname.startsWith(VENDOR_PREFIX);
  const isAdminPage = pathname.startsWith(ADMIN_PREFIX);
  const isProtectedPage = AUTH_REQUIRED.some((p) => pathname.startsWith(p));

  // Public pages — skip auth check entirely (no fetch)
  if (!isAuthPage && !isVendorPage && !isAdminPage && !isProtectedPage) {
    return NextResponse.next();
  }

  const role = await getRole(req);

  // Auth pages: already logged in → redirect home
  if (isAuthPage) {
    return role
      ? NextResponse.redirect(new URL('/', req.url))
      : NextResponse.next();
  }

  // No valid session
  if (!role) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Role-based guards
  if (isAdminPage && role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/', req.url));
  }
  if (isVendorPage && role !== 'VENDOR' && role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/).*)',
  ],
};
