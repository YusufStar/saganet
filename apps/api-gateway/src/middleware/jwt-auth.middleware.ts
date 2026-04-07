import { Inject, Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request, Response, NextFunction } from 'express';
import { REDIS_CLIENT, RedisClient } from '@saganet/redis';

interface JwtPayload {
  sub: string;
  role: string;
  sessionId: string;
}

@Injectable()
export class JwtAuthMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtService: JwtService,
    @Inject(REDIS_CLIENT) private readonly redis: RedisClient,
  ) {}

  async use(req: Request, res: Response, next: NextFunction): Promise<void> {
    const token = this.extractToken(req);
    if (!token) throw new UnauthorizedException('Authorization token missing');

    let payload: JwtPayload;
    try {
      payload = this.jwtService.verify<JwtPayload>(token);
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }

    // Redis'te aktif session kontrolü
    const sessionData = await this.redis.get(`session:${payload.sessionId}`);
    if (!sessionData) throw new UnauthorizedException('Session has been revoked or expired');

    // Downstream servislere user context ilet
    req.headers['x-user-id'] = payload.sub;
    req.headers['x-user-role'] = payload.role;
    req.headers['x-session-id'] = payload.sessionId;

    next();
  }

  private extractToken(req: Request): string | undefined {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      return authHeader.slice(7);
    }
    return undefined;
  }
}
