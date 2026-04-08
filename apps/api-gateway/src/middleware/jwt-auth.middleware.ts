import { Inject, Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request, Response, NextFunction } from 'express';
import { REDIS_CLIENT, RedisClient } from '@saganet/redis';

interface JwtPayload {
  sub: string;
  role: string;
  sessionId: string;
}

/**
 * Public route rules — checked inside the middleware instead of relying on
 * NestJS exclude(), which has unreliable wildcard matching for proxied paths.
 */
const PUBLIC_ROUTES: { path: RegExp; methods: Set<string> }[] = [
  // Auth — open endpoints
  { path: /^\/api\/auth\/register$/,        methods: new Set(['POST']) },
  { path: /^\/api\/auth\/login$/,            methods: new Set(['POST']) },
  { path: /^\/api\/auth\/refresh$/,          methods: new Set(['POST']) },
  { path: /^\/api\/auth\/verify-email$/,     methods: new Set(['GET'])  },
  { path: /^\/api\/auth\/forgot-password$/,  methods: new Set(['POST']) },
  { path: /^\/api\/auth\/reset-password$/,   methods: new Set(['POST']) },

  // Catalog — public read access
  { path: /^\/api\/catalog\/products(\/.*)?$/,   methods: new Set(['GET']) },
  { path: /^\/api\/catalog\/categories(\/.*)?$/, methods: new Set(['GET']) },

  // Inventory — public stock reads
  { path: /^\/api\/inventory\/stock(\/.*)?$/, methods: new Set(['GET']) },

  // Infrastructure
  { path: /^\/api\/health(\/.*)?$/, methods: new Set(['GET']) },
  { path: /^\/metrics$/,            methods: new Set(['GET']) },
  { path: /^\/docs(\/.*)?$/,        methods: new Set(['GET']) },
  { path: /^\/api\/swagger-proxy(\/.*)?$/, methods: new Set(['GET']) },
];

function isPublic(req: Request): boolean {
  const method = req.method.toUpperCase();
  return PUBLIC_ROUTES.some((rule) => rule.path.test(req.path) && rule.methods.has(method));
}

@Injectable()
export class JwtAuthMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtService: JwtService,
    @Inject(REDIS_CLIENT) private readonly redis: RedisClient,
  ) {}

  async use(req: Request, res: Response, next: NextFunction): Promise<void> {
    if (isPublic(req)) return next();

    const token = this.extractToken(req);
    if (!token) throw new UnauthorizedException('Authorization token missing');

    let payload: JwtPayload;
    try {
      payload = this.jwtService.verify<JwtPayload>(token);
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }

    const sessionData = await this.redis.get(`session:${payload.sessionId}`);
    if (!sessionData) throw new UnauthorizedException('Session has been revoked or expired');

    req.headers['x-user-id'] = payload.sub;
    req.headers['x-user-role'] = payload.role;
    req.headers['x-session-id'] = payload.sessionId;

    next();
  }

  private extractToken(req: Request): string | undefined {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) return authHeader.slice(7);
    return undefined;
  }
}
