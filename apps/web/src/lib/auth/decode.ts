export type UserRole = 'ADMIN' | 'VENDOR' | 'CUSTOMER';

export interface TokenPayload {
  sub: string;
  role: UserRole;
  sessionId: string;
  exp: number;
  iat: number;
}

/** Decode JWT payload without signature verification (for optimistic proxy checks). */
export function decodeToken(token: string): TokenPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = typeof atob !== 'undefined'
      ? atob(payload)
      : Buffer.from(payload, 'base64').toString('utf8');
    return JSON.parse(json) as TokenPayload;
  } catch {
    return null;
  }
}

export function isTokenExpired(payload: TokenPayload): boolean {
  return Date.now() / 1000 > payload.exp;
}

export const TOKEN_COOKIE = 'sat'; // Saganet Access Token
