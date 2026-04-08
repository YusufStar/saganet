# packages/db todos

## Scaffold
- [x] packages/db klasörü oluştur
- [x] package.json, tsconfig.json
- [x] TypeORM veya Prisma kararını ver ve ekle (→ TypeORM)

## Bağlantı Yönetimi
- [x] DatabaseModule (NestJS dynamic module)
- [x] Connection pool konfigürasyonu
- [ ] Read replica desteği hazırlığı
- [x] Graceful shutdown (connection kapat)

## Migration Altyapısı
- [x] Migration klasör yapısı (her servis kendi migrations/ klasörünü yönetir)
- [x] Migration oluşturma script'i (npm run migration:create)
- [x] Migration çalıştırma script'i (her serviste migration:run/revert/generate script'leri mevcut)
- [x] Migration geri alma script'i (her serviste migration:run/revert/generate script'leri mevcut)
- [x] Her servis kendi migration'larını buraya mı koyacak? → karar ver (Karar: her servis kendi migration'larını yönetir)

## Outbox Tablosu (Shared)
- [x] Outbox entity/model tanımla (id, topic, payload, sentAt, retryCount, createdAt)
- [x] Outbox için TypeORM repository veya Prisma client export et
- [x] Index: sent_at IS NULL, retry_count

## Seeding
- [x] Base seeder class
- [ ] Development seed: örnek ürün, kullanıcı, sipariş
- [ ] npm run seed:dev komutu

## Utilities
- [x] Pagination helper (offset & cursor)
- [x] Soft delete base entity
- [x] BaseEntity (id, createdAt, updatedAt)
- [x] Transaction helper wrapper

## Tests
- [ ] Test database setup (in-memory veya Docker testcontainers)
- [x] Migration idempotency testi

## Docs
- [x] Yeni migration ekleme rehberi
- [x] Outbox pattern kullanım örneği
