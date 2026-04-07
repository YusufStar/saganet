# Saganet — Geliştirici Kurulum Rehberi

## Gereksinimler

- Node.js 20+
- pnpm 9+
- Docker & Docker Compose

## 1. Bağımlılıkları Kur

```bash
pnpm install
```

## 2. Ortam Değişkenlerini Ayarla

Kök dizindeki `.env.example` dosyasını kopyala:

```bash
cp .env.example .env
```

> Tüm servisler kök dizindeki bu `.env` dosyasını okur.
> Servis-spesifik override için `apps/<servis>/.env.local` oluşturabilirsin.

## 3. Altyapıyı Başlat (Docker)

```bash
cd infra/docker
sudo docker compose up -d
```

Ayağa kalkan servisler:

| Servis      | Adres                        |
|-------------|------------------------------|
| PostgreSQL  | localhost:5432               |
| Redis       | localhost:6379               |
| Kafka       | localhost:9092               |
| Jaeger UI   | http://localhost:16686       |
| Prometheus  | http://localhost:9090        |
| Grafana     | http://localhost:3001        |

## 4. Migration'ları Çalıştır

> **Önemli:** `pnpm dev` migration'ları **otomatik çalıştırmaz**.
> Servis başlatmadan önce elle çalıştırman gerekir.

### auth-service

```bash
cd apps/auth-service
pnpm migration:run
```

Diğer servisler hazır oldukça bu bölüme eklenecektir.

### Migration geri alma

```bash
pnpm migration:revert
```

## 5. Servisleri Başlat

```bash
# Tek servis
cd apps/auth-service && pnpm dev

# Kökten (ileride turbo/nx entegrasyonu ile)
pnpm --filter @saganet/auth-service dev
```

## 6. API Dokümantasyonu (Swagger)

Swagger UI sadece `NODE_ENV !== production` modunda açıktır.

| Servis       | URL                                   |
|--------------|---------------------------------------|
| auth-service | http://localhost:3001/docs            |

## Outbox Pattern Nedir?

Outbox, olayları güvenilir şekilde Kafka'ya iletmek için kullanılan bir desendir:

```
[Servis İşlemi]
  DB transaction açılır
  → İş verisi kaydedilir (örn. yeni kullanıcı)
  → Outbox tablosuna event yazılır  ← aynı transaction
  DB transaction commit olur

[Outbox Relay Worker]  (ileride implement edilecek)
  → Outbox tablosunu poll eder (sentAt IS NULL)
  → Kafka'ya publish eder
  → sentAt güncellenir
```

**Neden lazım?**
Direkt Kafka publish yapılırsa: DB commit başarılı ama Kafka publish fail olabilir.
Outbox ile: ya her ikisi de kaydedilir ya da hiçbiri — atomik güvence sağlanır.
