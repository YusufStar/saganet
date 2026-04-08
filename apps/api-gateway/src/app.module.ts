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
    // Use pathFilter inside http-proxy-middleware instead of NestJS forRoutes path matching,
    // because forRoutes wildcard patterns are unreliable for unregistered/proxied routes.
    for (const route of getRoutes()) {
      const prefix = route.prefix;
      const proxy = createProxyMiddleware({
        target: route.target,
        changeOrigin: true,
        pathFilter: (reqPath) => reqPath.startsWith(prefix),
        ...(route.pathRewrite ? { pathRewrite: route.pathRewrite } : {}),
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
        .forRoutes({ path: '{*path}', method: RequestMethod.ALL });
    }
  }
}
