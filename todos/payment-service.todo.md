# payment-service todos

## Scaffold
- [ ] NestJS projesi oluştur
- [ ] apps/payment-service klasörüne ekle
- [ ] Bağımlılıklar: stripe (veya mock provider), TypeORM/Prisma

## Payment Domain
- [ ] Payment entity (id, orderId, userId, amount, currency, status, provider, createdAt)
- [ ] PaymentStatus enum: PENDING, COMPLETED, FAILED, REFUNDED
- [ ] Ödeme geçmişi sorgulama endpoint'i

## Ödeme Akışı (Saga)
- [ ] payment.charge komutu dinle (order-service'ten)
- [ ] Ödemeyi işle (provider'a gönder)
- [ ] Başarılıysa: payment.completed event yayınla
- [ ] Başarısızsa: payment.failed event yayınla

## Provider Entegrasyonu
- [ ] PaymentProvider interface tanımla
- [ ] Mock provider (geliştirme/test için)
- [ ] Stripe provider implementasyonu
- [ ] Provider'ı environment config ile seç

## İade (Refund)
- [ ] Refund komutu dinle (compensation)
- [ ] Provider'dan iade başlat
- [ ] payment.refunded event yayınla

## Idempotency
- [ ] Aynı orderId için tekrar ödeme isteği gelirse kontrol et
- [ ] Provider idempotency key kullan

## Outbox Pattern
- [ ] Outbox tablosu
- [ ] DB transaction: payment + outbox atomik
- [ ] Outbox relay worker

## Güvenlik
- [ ] Ödeme verilerini loglamaktan kaçın (PCI uyumu)
- [ ] Webhook imza doğrulama (Stripe webhook secret)
- [ ] Amount manipülasyon koruması (server-side hesapla)

## Database
- [ ] Migration: payments tablosu
- [ ] Migration: outbox tablosu
- [ ] Index: order_id, user_id, status

## Kafka Events (Yayınla)
- [ ] payment.completed
- [ ] payment.failed
- [ ] payment.refunded

## Kafka Events (Dinle)
- [ ] payment.charge (komut)
- [ ] payment.refund (compensation komutu)

## Observability
- [ ] OpenTelemetry tracing
- [ ] Ödeme başarı/başarısız metriği
- [ ] İşlem süresi histogram
- [ ] Structured JSON log (hassas veri maskeleme)
- [ ] /health endpoint

## Tests
- [ ] Unit: ödeme işleme mantığı, provider soyutlaması
- [ ] Integration: mock provider ile mutlu yol
- [ ] Integration: başarısız ödeme → payment.failed
- [ ] Integration: iade akışı

## Docs
- [ ] Swagger endpoint'leri
- [ ] Provider değiştirme rehberi
