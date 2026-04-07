# notification-service todos

## Scaffold

- [x] NestJS projesi oluştur
- [x] apps/notification-service klasörüne ekle
- [x] Bağımlılıklar: nodemailer, @nestjs/bull (veya BullMQ)

## Bildirim Kanalları

- [x] E-posta kanalı (Nodemailer / SendGrid)
- [x] NotificationChannel interface tanımla

## Template Sistemi

- [x] Template engine seç (Handlebars veya Mjml)
- [x] Sipariş oluşturuldu template'i
- [x] Sipariş tamamlandı template'i
- [x] Sipariş başarısız template'i
- [x] Hoş geldin / kayıt doğrulama template'i
- [x] Şifre sıfırlama template'i

## Queue

- [x] BullMQ ile bildirim kuyruğu kur
- [x] Retry mekanizması (max 3 deneme, exponential backoff)
- [x] Dead letter queue (başarısız bildirimler)
- [x] Öncelik sırası (kritik > normal)

## Kafka Events (Dinle)

- [x] order.created → sipariş oluşturuldu bildirimi
- [x] order.completed → sipariş tamamlandı bildirimi
- [x] order.failed → sipariş başarısız bildirimi
- [x] user.registered → hoş geldin e-postası
- [x] payment.completed → ödeme onay bildirimi
- [x] payment.refunded → iade bildirimi

## Tercih Yönetimi

- [x] Kullanıcı bildirim tercihleri tablosu
- [x] Kanal bazlı opt-in/opt-out

## Database

- [x] Migration: notifications tablosu (gönderim kaydı)
- [x] Migration: notification_preferences tablosu
- [x] Index: user_id, status, created_at

## Observability

- [x] OpenTelemetry tracing
- [x] Gönderilen/başarısız bildirim metriği
- [x] Queue derinliği metriği
- [x] Structured JSON log
- [x] /health endpoint

## Tests

- [x] Unit: template rendering
- [x] Unit: kanal seçim mantığı
- [x] Integration: Kafka event → kuyruk → gönderim
- [x] Mock: e-posta/SMS gönderimi

## Docs

- [x] Template değiştirme / ekleme rehberi
- [x] Yeni kanal ekleme rehberi
