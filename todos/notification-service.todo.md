# notification-service todos

## Scaffold
- [ ] NestJS projesi oluştur
- [ ] apps/notification-service klasörüne ekle
- [ ] Bağımlılıklar: nodemailer, @nestjs/bull (veya BullMQ)

## Bildirim Kanalları
- [ ] E-posta kanalı (Nodemailer / SendGrid)
- [ ] SMS kanalı (Twilio — opsiyonel/mock)
- [ ] Push notification hazırlığı (Firebase — ilerleyen aşama)
- [ ] NotificationChannel interface tanımla

## Template Sistemi
- [ ] Template engine seç (Handlebars veya Mjml)
- [ ] Sipariş oluşturuldu template'i
- [ ] Sipariş tamamlandı template'i
- [ ] Sipariş başarısız template'i
- [ ] Hoş geldin / kayıt doğrulama template'i
- [ ] Şifre sıfırlama template'i

## Queue
- [ ] BullMQ ile bildirim kuyruğu kur
- [ ] Retry mekanizması (max 3 deneme, exponential backoff)
- [ ] Dead letter queue (başarısız bildirimler)
- [ ] Öncelik sırası (kritik > normal)

## Kafka Events (Dinle)
- [ ] order.created → sipariş oluşturuldu bildirimi
- [ ] order.completed → sipariş tamamlandı bildirimi
- [ ] order.failed → sipariş başarısız bildirimi
- [ ] user.registered → hoş geldin e-postası
- [ ] payment.completed → ödeme onay bildirimi
- [ ] payment.refunded → iade bildirimi

## Tercih Yönetimi
- [ ] Kullanıcı bildirim tercihleri tablosu
- [ ] Kanal bazlı opt-in/opt-out

## Database
- [ ] Migration: notifications tablosu (gönderim kaydı)
- [ ] Migration: notification_preferences tablosu
- [ ] Index: user_id, status, created_at

## Observability
- [ ] OpenTelemetry tracing
- [ ] Gönderilen/başarısız bildirim metriği
- [ ] Queue derinliği metriği
- [ ] Structured JSON log
- [ ] /health endpoint

## Tests
- [ ] Unit: template rendering
- [ ] Unit: kanal seçim mantığı
- [ ] Integration: Kafka event → kuyruk → gönderim
- [ ] Mock: e-posta/SMS gönderimi

## Docs
- [ ] Template değiştirme / ekleme rehberi
- [ ] Yeni kanal ekleme rehberi
