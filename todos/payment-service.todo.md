# payment-service todos

## Scaffold

- [x] NestJS projesi oluştur
- [x] apps/payment-service klasörüne ekle
- [x] Bağımlılıklar: stripe (veya mock provider), TypeORM/Prisma

## Payment Domain

- [x] Payment entity (id, orderId, userId, amount, currency, status, provider, createdAt)
- [x] PaymentStatus enum: PENDING, COMPLETED, FAILED, REFUNDED
- [x] Ödeme geçmişi sorgulama endpoint'i

## Ödeme Akışı (Saga)

- [x] payment.charge komutu dinle (order-service'ten)
- [x] Ödemeyi işle (provider'a gönder)
- [x] Başarılıysa: payment.completed event yayınla
- [x] Başarısızsa: payment.failed event yayınla

## Provider Entegrasyonu

- [x] PaymentProvider interface tanımla
- [x] Mock provider (geliştirme/test için)
- [x] Stripe provider implementasyonu (mock implementation — extend PaymentProvider interface for real providers)
- [x] Provider'ı environment config ile seç

## İade (Refund)

- [x] Refund komutu dinle (compensation)
- [x] Provider'dan iade başlat
- [x] payment.refunded event yayınla

## Idempotency

- [x] Aynı orderId için tekrar ödeme isteği gelirse kontrol et
- [x] Provider idempotency key kullan

## Outbox Pattern

- [x] Outbox tablosu
- [x] DB transaction: payment + outbox atomik
- [x] Outbox relay worker

## Güvenlik

- [x] Ödeme verilerini loglamaktan kaçın (PCI uyumu)
- [x] Webhook imza doğrulama (Stripe webhook secret)
- [x] Amount manipülasyon koruması (server-side hesapla)

## Database

- [x] Migration: payments tablosu
- [x] Migration: outbox tablosu
- [x] Index: order_id, user_id, status

## Kafka Events (Yayınla)

- [x] payment.completed
- [x] payment.failed
- [x] payment.refunded

## Kafka Events (Dinle)

- [x] payment.charge (komut)
- [x] payment.refund (compensation komutu)

## Observability

- [x] OpenTelemetry tracing
- [x] Ödeme başarı/başarısız metriği
- [x] İşlem süresi histogram
- [x] Structured JSON log (hassas veri maskeleme)
- [x] /health endpoint

## Tests

- [x] Unit: ödeme işleme mantığı, provider soyutlaması
- [x] Integration: mock provider ile mutlu yol
- [x] Integration: başarısız ödeme → payment.failed
- [x] Integration: iade akışı

## Docs

- [x] Swagger endpoint'leri
- [x] Provider değiştirme rehberi
