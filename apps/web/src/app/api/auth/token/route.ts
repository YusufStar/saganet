import { NextRequest, NextResponse } from 'next/server';
import { TOKEN_COOKIE } from '@/lib/auth/decode';

const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: 'lax' as const,
  path: '/',
  secure: process.env.NODE_ENV === 'production',
};

/** POST /api/auth/token — set httpOnly access token cookie after login */
export async function POST(req: NextRequest) {
  const { access_token } = await req.json() as { access_token: string };
  if (!access_token) {
    return NextResponse.json({ error: 'access_token required' }, { status: 400 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(TOKEN_COOKIE, access_token, {
    ...COOKIE_OPTS,
    maxAge: 60 * 60 * 24, // 1 day max (token expiry is shorter)
  });
  return res;
}

/** DELETE /api/auth/token — clear token cookie on logout */
export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(TOKEN_COOKIE, '', { ...COOKIE_OPTS, maxAge: 0 });
  return res;
}
