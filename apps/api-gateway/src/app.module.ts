import * as path from 'path';
import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { RedisModule } from '@saganet/redis';
import { HealthModule } from './health/health.module';
import { JwtAuthMiddleware } from './middleware/jwt-auth.middleware';

const envFilePath = [
  path.join(__dirname, '../../../.env'),
  path.join(process.cwd(), '../../.env'),
  '.env',
];

@Module({
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
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(JwtAuthMiddleware)
      .exclude(
        { path: 'api/auth/register', method: RequestMethod.POST },
        { path: 'api/auth/login', method: RequestMethod.POST },
        { path: 'api/health', method: RequestMethod.GET },
        { path: 'docs', method: RequestMethod.GET },
        { path: 'docs/(.*)', method: RequestMethod.GET },
      )
      .forRoutes('*');
  }
}
