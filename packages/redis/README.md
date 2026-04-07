# @saganet/redis

Redis client package for saganet microservices.

## Usage

### In a NestJS module

```typescript
import { RedisModule } from '@saganet/redis';

@Module({
  imports: [RedisModule.forRoot()],
})
export class AppModule {}
```

### CacheHelper

```typescript
import { REDIS_CLIENT } from '@saganet/redis';
import { CacheHelper } from '@saganet/redis';

constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {
  this.cache = new CacheHelper(redis);
}

await this.cache.set('product:123', product, 300); // TTL 5min
const product = await this.cache.get<Product>('product:123');
await this.cache.del('product:123');
```

### DistributedLock

```typescript
const lock = new DistributedLock(this.redis);
await lock.withLock('lock:order:123', 5000, async () => {
  // exclusive operation
});
```

### RateLimiter

```typescript
const limiter = new RateLimiter(this.redis);
const result = await limiter.check(`rl:${ip}`, 100, 60);
if (!result.allowed) throw new TooManyRequestsException();
```
