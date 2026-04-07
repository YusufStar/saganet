# order-service todos

## Scaffold

- [x] NestJS projesi oluştur
- [x] apps/order-service klasörüne ekle
- [x] Bağımlılıklar: TypeORM/Prisma, kafkajs

## Order Domain

- [x] Order entity (id, userId, status, totalAmount, createdAt, updatedAt)
- [x] OrderItem entity (id, orderId, productId, quantity, unitPrice)
- [x] OrderStatus enum: PENDING, CONFIRMED, FAILED, CANCELLED, COMPLETED
- [x] Sipariş oluşturma endpoint'i (POST /orders)
- [x] Sipariş sorgulama (GET /orders/:id, GET /orders?userId=)
- [x] Sipariş iptal endpoint'i

## Saga Orchestration

- [x] Saga state machine tasarla
  - [x] PENDING → inventory reserve gönder
  - [x] INVENTORY_RESERVED → payment charge gönder
  - [x] PAYMENT_COMPLETED → order.completed event yayınla
  - [x] PAYMENT_FAILED → compensation: inventory release gönder → order.failed
  - [x] INVENTORY_FAILED → order.failed event yayınla
- [x] Saga state tablosu (sagaId, orderId, step, status, payload)
- [x] Timeout handling: belirli sürede cevap gelmezse compensation

## Outbox Pattern

- [x] Outbox tablosu
- [x] DB transaction: order + outbox atomik
- [x] Outbox relay worker

## Idempotency

- [x] Aynı istek tekrar gelirse aynı siparişi döndür
- [x] Idempotency key (X-Idempotency-Key header)

## Kafka Events (Yayınla)

- [x] order.created
- [x] order.completed
- [x] order.failed
- [x] inventory.reserve (komut)
- [x] payment.charge (komut)
- [x] inventory.release (compensation komutu)

## Kafka Events (Dinle)

- [x] inventory.reserved
- [x] inventory.reservation-failed
- [x] payment.completed
- [x] payment.failed

## Database

- [x] Migration: orders tablosu
- [x] Migration: order_items tablosu
- [x] Migration: saga_states tablosu
- [x] Migration: outbox tablosu

## Observability

- [x] OpenTelemetry tracing (saga adımlarını trace et)
- [x] Sipariş tamamlanma süresi metriği
- [x] Başarı/başarısız oran metriği
- [x] Structured JSON log
- [x] /health endpoint

## Tests

- [x] Unit: saga state machine geçişleri
- [x] Integration: mutlu yol (happy path) saga akışı
- [x] Integration: compensation akışı
- [x] E2E: sipariş oluştur → tamamla

## Docs

- [x] Swagger endpoint'leri
- [x] Saga akış diyagramı (docs/ altına)
