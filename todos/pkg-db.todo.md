# packages/db todos

## Scaffold
- [ ] packages/db klasörü oluştur
- [ ] package.json, tsconfig.json
- [ ] TypeORM veya Prisma kararını ver ve ekle

## Bağlantı Yönetimi
- [ ] DatabaseModule (NestJS dynamic module)
- [ ] Connection pool konfigürasyonu
- [ ] Read replica desteği hazırlığı
- [ ] Graceful shutdown (connection kapat)

## Migration Altyapısı
- [ ] Migration klasör yapısı: packages/db/migrations/
- [ ] Migration oluşturma script'i (npm run migration:create)
- [ ] Migration çalıştırma script'i (npm run migration:run)
- [ ] Migration geri alma script'i (npm run migration:revert)
- [ ] Her servis kendi migration'larını buraya mı koyacak? → karar ver

## Outbox Tablosu (Shared)
- [ ] Outbox entity/model tanımla (id, topic, payload, sentAt, retryCount, createdAt)
- [ ] Outbox için TypeORM repository veya Prisma client export et
- [ ] Index: sent_at IS NULL, retry_count

## Seeding
- [ ] Base seeder class
- [ ] Development seed: örnek ürün, kullanıcı, sipariş
- [ ] npm run seed:dev komutu

## Utilities
- [ ] Pagination helper (offset & cursor)
- [ ] Soft delete base entity
- [ ] BaseEntity (id, createdAt, updatedAt)
- [ ] Transaction helper wrapper

## Tests
- [ ] Test database setup (in-memory veya Docker testcontainers)
- [ ] Migration idempotency testi

## Docs
- [ ] Yeni migration ekleme rehberi
- [ ] Outbox pattern kullanım örneği
