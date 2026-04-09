import * as path from 'path';
import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { RedisModule } from '@saganet/redis';
import { HealthModule } from './health/health.module';
import { MetricsModule } from './metrics/metrics.module';
import { SwaggerProxyController } from './proxy/swagger-proxy.controller';
import { JwtAuthMiddleware } from './middleware/jwt-auth.middleware';
import { RequestIdMiddleware } from './middleware/request-id.middleware';
import { ContentTypeMiddleware } from './middleware/content-type.middleware';
import { RateLimitMiddleware } from './middleware/rate-limit.middleware';
import { MetricsMiddleware } from './middleware/metrics.middleware';
import { getRoutes } from './proxy/route.config';
import { getBreaker } from './proxy/circuit-breakers';

const envFilePath = [
  path.join(__dirname, '../../../.env'),
  path.join(process.cwd(), '../../.env'),
  '.env',
];


@Module({
  controllers: [SwaggerProxyController],
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath }),
    JwtModule.registerAsync({
      global: true,
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_SECRET'),
      }),
      inject: [ConfigService],
    }),
    RedisModule.forRoot(),
    HealthModule,
    MetricsModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // 0. Metrics collection — first, so it captures all requests
    consumer.apply(MetricsMiddleware).forRoutes({ path: '{*path}', method: RequestMethod.ALL });

    // 1. Request ID — every request gets a unique trace ID
    consumer.apply(RequestIdMiddleware).forRoutes({ path: '{*path}', method: RequestMethod.ALL });

    // 2. Content-Type — enforce JSON for mutation requests
    consumer.apply(ContentTypeMiddleware).forRoutes({ path: '{*path}', method: RequestMethod.ALL });

    // 3. Rate limiting — Redis-backed, distributed
    consumer.apply(RateLimitMiddleware).forRoutes({ path: '{*path}', method: RequestMethod.ALL });

    // 4. JWT auth — public route whitelist is handled inside the middleware via regex
    consumer.apply(JwtAuthMiddleware).forRoutes({ path: '{*path}', method: RequestMethod.ALL });

    // 5. Proxy — forward to downstream services LAST
    // Circuit breaker wraps each proxy — fast-fails when upstream is down.
    for (const route of getRoutes()) {
      const prefix = route.prefix;
      const breaker = getBreaker(prefix);

      // Circuit breaker middleware — checks before proxy
      const circuitMiddleware = (_req: any, res: any, next: any) => {
        if (breaker && breaker.currentState === 'OPEN') {
          return res.status(503).json({
            statusCode: 503,
            message: `Service temporarily unavailable (circuit open: ${breaker.name})`,
          });
        }
        next();
      };

      const proxy = createProxyMiddleware({
        target: route.target,
        changeOrigin: true,
        pathFilter: (reqPath) => reqPath.startsWith(prefix),
        ...(route.pathRewrite ? { pathRewrite: route.pathRewrite } : {}),
        on: {
          proxyReq: (proxyReq) => {
            const secret = process.env.INTERNAL_SECRET;
            if (secret) {
              proxyReq.setHeader('x-internal-secret', secret);
            }
          },
          proxyRes: () => {
            // Successful proxy response — record success in circuit breaker
            if (breaker) {
              try { breaker.exec(async () => {}); } catch { /* ignore */ }
            }
          },
          error: (_err, _req, res) => {
            // Upstream failed — record failure in circuit breaker
            if (breaker) {
              breaker.exec(async () => { throw new Error('proxy error'); }).catch(() => {});
            }
            (res as any).status?.(502).json({
              statusCode: 502,
              message: 'Upstream service unavailable',
            });
          },
        },
      });

      consumer
        .apply(circuitMiddleware, proxy)
        .forRoutes({ path: '{*path}', method: RequestMethod.ALL });
    }
  }
}
