# inventory-service todos

## Scaffold
- [x] NestJS projesi oluştur
- [x] apps/inventory-service klasörüne ekle
- [ ] Bağımlılıklar: TypeORM/Prisma, ioredis

## Stock Domain
- [ ] Inventory entity (id, productId, quantity, reserved, available)
- [ ] Stok hareketleri tablosu (StockLedger: type, delta, referenceId, createdAt)
- [ ] CRUD: stok ekle, güncelle, sorgula

## Rezervasyon Akışı (Saga)
- [ ] inventory.reserve komutu dinle (order-service'ten)
- [ ] Yeterli stok varsa: stok rezerve et → inventory.reserved event yayınla
- [ ] Yetersiz stokta: inventory.reservation-failed event yayınla
- [ ] inventory.release komutu dinle (compensasyon)
- [ ] Rezervasyonu serbest bırak → inventory.released event yayınla

## Idempotency
- [ ] Her rezervasyon isteği için idempotency key kontrolü
- [ ] Tekrar gelen komutları sessizce yok say

## Outbox Pattern
- [ ] Outbox tablosu oluştur
- [ ] DB transaction: stok güncelle + outbox insert atomik
- [ ] Outbox relay worker

## Concurrency
- [ ] Optimistic locking (version kolon) veya SELECT FOR UPDATE
- [ ] Race condition testleri

## Database
- [ ] Migration: inventory tablosu
- [ ] Migration: stock_ledger tablosu
- [ ] Migration: outbox tablosu
- [ ] Index: product_id, reference_id

## Kafka Events
- [ ] inventory.reserved → yayınla
- [ ] inventory.reservation-failed → yayınla
- [ ] inventory.released → yayınla
- [ ] inventory.stock-updated → yayınla (catalog'a)

## Observability
- [ ] OpenTelemetry tracing
- [ ] Düşük stok alarmı metriği
- [ ] Structured JSON log
- [ ] /health endpoint

## Tests
- [ ] Unit: rezervasyon mantığı, idempotency
- [ ] Integration: stok rezerve → serbest döngüsü
- [ ] Concurrency: paralel rezervasyon testi

## Docs
- [ ] Swagger endpoint'leri
- [ ] Stok akış diyagramı
