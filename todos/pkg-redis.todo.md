# packages/redis todos

## Scaffold
- [x] packages/redis klasörü oluştur
- [x] package.json, tsconfig.json
- [x] ioredis bağımlılığı

## Bağlantı Yönetimi
- [x] createRedisClient factory (env-based config)
- [x] RedisModule (NestJS dynamic module, global)
- [x] Graceful shutdown (redis.quit)
- [ ] Read replica / cluster desteği hazırlığı

## Config
- [x] Host, port, password, db env'den al
- [x] Key prefix desteği
- [ ] TLS / SSL konfigürasyonu (production)

## Utilities
- [x] Cache helper (get/set/del with TTL wrapper)
- [x] Distributed lock (Redlock benzeri)
- [x] Rate limiter helper

## Tests
- [ ] Unit: mock ioredis ile bağlantı factory testi
- [ ] Integration: Docker testcontainers ile Redis

## Docs
- [x] Servislerde nasıl kullanılır örneği
