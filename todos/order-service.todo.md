# order-service todos

## Scaffold
- [x] NestJS projesi oluştur
- [x] apps/order-service klasörüne ekle
- [ ] Bağımlılıklar: TypeORM/Prisma, kafkajs

## Order Domain
- [ ] Order entity (id, userId, status, totalAmount, createdAt, updatedAt)
- [ ] OrderItem entity (id, orderId, productId, quantity, unitPrice)
- [ ] OrderStatus enum: PENDING, CONFIRMED, FAILED, CANCELLED, COMPLETED
- [ ] Sipariş oluşturma endpoint'i (POST /orders)
- [ ] Sipariş sorgulama (GET /orders/:id, GET /orders?userId=)
- [ ] Sipariş iptal endpoint'i

## Saga Orchestration
- [ ] Saga state machine tasarla
  - [ ] PENDING → inventory reserve gönder
  - [ ] INVENTORY_RESERVED → payment charge gönder
  - [ ] PAYMENT_COMPLETED → order.completed event yayınla
  - [ ] PAYMENT_FAILED → compensation: inventory release gönder → order.failed
  - [ ] INVENTORY_FAILED → order.failed event yayınla
- [ ] Saga state tablosu (sagaId, orderId, step, status, payload)
- [ ] Timeout handling: belirli sürede cevap gelmezse compensation

## Outbox Pattern
- [ ] Outbox tablosu
- [ ] DB transaction: order + outbox atomik
- [ ] Outbox relay worker

## Idempotency
- [ ] Aynı istek tekrar gelirse aynı siparişi döndür
- [ ] Idempotency key (X-Idempotency-Key header)

## Kafka Events (Yayınla)
- [ ] order.created
- [ ] order.completed
- [ ] order.failed
- [ ] inventory.reserve (komut)
- [ ] payment.charge (komut)
- [ ] inventory.release (compensation komutu)

## Kafka Events (Dinle)
- [ ] inventory.reserved
- [ ] inventory.reservation-failed
- [ ] payment.completed
- [ ] payment.failed

## Database
- [ ] Migration: orders tablosu
- [ ] Migration: order_items tablosu
- [ ] Migration: saga_states tablosu
- [ ] Migration: outbox tablosu

## Observability
- [ ] OpenTelemetry tracing (saga adımlarını trace et)
- [ ] Sipariş tamamlanma süresi metriği
- [ ] Başarı/başarısız oran metriği
- [ ] Structured JSON log
- [ ] /health endpoint

## Tests
- [ ] Unit: saga state machine geçişleri
- [ ] Integration: mutlu yol (happy path) saga akışı
- [ ] Integration: compensation akışı
- [ ] E2E: sipariş oluştur → tamamla

## Docs
- [ ] Swagger endpoint'leri
- [ ] Saga akış diyagramı (docs/ altına)
