import { Inject, Injectable } from '@nestjs/common';
import { REDIS_CLIENT, RedisClient } from '@saganet/redis';
import { ProductResponseDto } from './dto/product-response.dto';

const CACHE_TTL = 300; // 5 minutes
const key = (id: string) => `catalog:product:${id}`;

@Injectable()
export class ProductCacheService {
  constructor(@Inject(REDIS_CLIENT) private readonly redis: RedisClient) {}

  async getProduct(id: string): Promise<ProductResponseDto | null> {
    const raw = await this.redis.get(key(id));
    if (!raw) return null;
    return JSON.parse(raw) as ProductResponseDto;
  }

  async setProduct(id: string, product: ProductResponseDto): Promise<void> {
    await this.redis.set(key(id), JSON.stringify(product), 'EX', CACHE_TTL);
  }

  async invalidateProduct(id: string): Promise<void> {
    await this.redis.del(key(id));
  }
}
