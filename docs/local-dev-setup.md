# Yerel Geliştirme Kurulumu

## Gereksinimler

- Node.js 20+
- pnpm 9+
- Docker + Docker Compose

## Hızlı Başlangıç

```bash
# 1. Bağımlılıkları yükle
pnpm install

# 2. Altyapıyı başlat (Postgres, Kafka, Redis, Jaeger, Prometheus, Grafana, MinIO, RabbitMQ)
cd infra/docker
docker compose up -d

# 3. Ortam değişkenlerini ayarla
cp .env.example .env
# .env dosyasını düzenle

# 4. Migration'ları çalıştır (her servis için)
pnpm --filter @saganet/auth-service migration:run
pnpm --filter @saganet/catalog-service migration:run
pnpm --filter @saganet/inventory-service migration:run
pnpm --filter @saganet/order-service migration:run
pnpm --filter @saganet/payment-service migration:run
pnpm --filter @saganet/notification-service migration:run

# 5. Tüm servisleri başlat
pnpm dev
```

## Servis Portları

| Servis | Port |
|--------|------|
| Web (Next.js) | 3333 |
| API Gateway | 3000 |
| Auth Service | 3001 |
| Catalog Service | 3002 |
| Inventory Service | 3003 |
| Order Service | 3004 |
| Payment Service | 3005 |
| Notification Service | 3006 |

## Altyapı Portları

| Servis | Port |
|--------|------|
| PostgreSQL | 5432 |
| Kafka | 9092 |
| Redis | 6379 |
| MinIO API | 9000 |
| MinIO UI | 9001 |
| RabbitMQ AMQP | 5672 |
| RabbitMQ UI | 15672 |
| Jaeger UI | 16686 |
| Prometheus | 9090 |
| Grafana | 4000 |

## Swagger API Dokümantasyonu

http://localhost:3000/docs

## Test Kullanıcıları

Admin: `admin@saganet.com` / `Admin1234!` (ilk başlatmada otomatik oluşturulur)

## Mock Ödeme

Test kartı: `4242 4242 4242 4242` / Exp: `12/34` / CVV: `123`
Simülasyon: `POST /api/payments/webhook/simulate`
