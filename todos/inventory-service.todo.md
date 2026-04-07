# inventory-service todos

## Scaffold

- [x] NestJS projesi oluştur
- [x] apps/inventory-service klasörüne ekle
- [x] Bağımlılıklar: TypeORM/Prisma, ioredis

## Stock Domain

- [x] Inventory entity (id, productId, quantity, reserved, available)
- [x] Stok hareketleri tablosu (StockLedger: type, delta, referenceId, createdAt)
- [x] CRUD: stok ekle, güncelle, sorgula

## Rezervasyon Akışı (Saga)

- [x] inventory.reserve komutu dinle (order-service'ten)
- [x] Yeterli stok varsa: stok rezerve et → inventory.reserved event yayınla
- [x] Yetersiz stokta: inventory.reservation-failed event yayınla
- [x] inventory.release komutu dinle (compensasyon)
- [x] Rezervasyonu serbest bırak → inventory.released event yayınla

## Idempotency

- [x] Her rezervasyon isteği için idempotency key kontrolü
- [x] Tekrar gelen komutları sessizce yok say

## Outbox Pattern

- [x] Outbox tablosu oluştur
- [x] DB transaction: stok güncelle + outbox insert atomik
- [x] Outbox relay worker

## Concurrency

- [x] Optimistic locking (version kolon) veya SELECT FOR UPDATE
- [x] Race condition testleri

## Database

- [x] Migration: inventory tablosu
- [x] Migration: stock_ledger tablosu
- [x] Migration: outbox tablosu
- [x] Index: product_id, reference_id

## Kafka Events

- [x] inventory.reserved → yayınla
- [x] inventory.reservation-failed → yayınla
- [x] inventory.released → yayınla
- [x] inventory.stock-updated → yayınla (catalog'a)

## Observability

- [x] OpenTelemetry tracing
- [x] Düşük stok alarmı metriği
- [x] Structured JSON log
- [x] /health endpoint

## Tests

- [x] Unit: rezervasyon mantığı, idempotency
- [x] Integration: stok rezerve → serbest döngüsü
- [x] Concurrency: paralel rezervasyon testi

## Docs

- [x] Swagger endpoint'leri
- [x] Stok akış diyagramı
