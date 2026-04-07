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

const envFilePath = [
  path.join(__dirname, '../../../.env'),
  path.join(process.cwd(), '../../.env'),
  '.env',
];

// Public routes that bypass JWT auth
const PUBLIC_ROUTES = [
  { path: 'api/auth/register',        method: RequestMethod.POST },
  { path: 'api/auth/login',           method: RequestMethod.POST },
  { path: 'api/auth/refresh',         method: RequestMethod.POST },
  { path: 'api/auth/verify-email',    method: RequestMethod.GET  },
  { path: 'api/auth/forgot-password', method: RequestMethod.POST },
  { path: 'api/auth/reset-password',  method: RequestMethod.POST },
  { path: 'api/health',               method: RequestMethod.GET  },
  { path: 'docs',                     method: RequestMethod.GET  },
  { path: 'docs/(.*)',                method: RequestMethod.GET  },
  { path: 'api/swagger-proxy/(.*)',   method: RequestMethod.GET  },
  { path: 'api/catalog/products',                   method: RequestMethod.GET },
  { path: 'api/catalog/products/(.*)',               method: RequestMethod.GET },
  { path: 'api/catalog/categories',                  method: RequestMethod.GET },
  { path: 'api/catalog/categories/(.*)',             method: RequestMethod.GET },
  { path: 'api/inventory/stock/(.*)',                method: RequestMethod.GET },
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
    consumer.apply(MetricsMiddleware).forRoutes('*');

    // 1. Request ID — every request gets a unique trace ID
    consumer.apply(RequestIdMiddleware).forRoutes('*');

    // 2. Content-Type — enforce JSON for mutation requests
    consumer.apply(ContentTypeMiddleware).forRoutes('*');

    // 3. Rate limiting — Redis-backed, distributed
    consumer.apply(RateLimitMiddleware).forRoutes('*');

    // 4. JWT auth — skip public routes
    consumer.apply(JwtAuthMiddleware).exclude(...PUBLIC_ROUTES).forRoutes('*');

    // 5. Proxy — forward to downstream services LAST
    for (const route of getRoutes()) {
      const proxy = createProxyMiddleware({
        target: route.target,
        changeOrigin: true,
        on: {
          error: (_err, _req, res) => {
            (res as any).status?.(502).json({
              statusCode: 502,
              message: 'Upstream service unavailable',
            });
          },
        },
      });

      consumer
        .apply(proxy)
        .forRoutes({ path: `${route.prefix}/(.*)`, method: RequestMethod.ALL });
    }
  }
}
