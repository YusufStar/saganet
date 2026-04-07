# catalog-service todos

## Scaffold
- [x] NestJS projesi oluştur
- [x] apps/catalog-service klasörüne ekle
- [ ] Bağımlılıklar: TypeORM/Prisma, class-validator

## Product Domain
- [ ] Product entity tasarla (id, name, description, price, stock, categoryId, images, createdAt)
- [ ] Category entity (id, name, parentId — ağaç yapısı)
- [ ] CRUD endpoint'leri (Product & Category)
- [ ] Slug üretimi (SEO-friendly URL)
- [ ] Soft delete

## Arama & Filtreleme
- [ ] Fiyat, kategori, stok durumu filtresi
- [ ] Fulltext arama (PostgreSQL tsvector veya ElasticSearch)
- [ ] Sıralama (fiyat, tarih, popülerlik)
- [ ] Cursor-based pagination

## Görsel / Medya
- [ ] Ürün görseli upload endpoint'i
- [ ] Görsel boyutlandırma (thumbnail, full)
- [ ] CDN entegrasyon hazırlığı

## Database
- [ ] Migration: products tablosu
- [ ] Migration: categories tablosu
- [ ] Migration: product_images tablosu
- [ ] Index: price, category_id, created_at

## Kafka Events
- [ ] product.created event yayınla
- [ ] product.price-changed event yayınla
- [ ] product.deleted event yayınla
- [ ] inventory-service'ten stock.updated event dinle

## Cache
- [ ] Redis ile ürün detay cache (TTL: 5dk)
- [ ] Cache invalidation: product.updated event'inde

## Observability
- [ ] OpenTelemetry tracing
- [ ] Ürün görüntüleme metriği
- [ ] Structured JSON log
- [ ] /health endpoint

## Tests
- [ ] Unit: fiyat doğrulama, slug üretimi
- [ ] Integration: CRUD akışı
- [ ] E2E: ürün arama

## Docs
- [ ] Swagger endpoint'leri
- [ ] Ürün şeması dokümantasyonu
