# packages/observability todos

## Scaffold
- [x] packages/observability klasörü oluştur
- [x] package.json, tsconfig.json
- [x] Bağımlılıklar: pino (pino + pino-pretty)

## Tracing (OpenTelemetry)
- [ ] TracingModule (NestJS dynamic module)
- [ ] OTLP exporter (Jaeger'a gönder)
- [ ] Auto-instrumentation: HTTP, Kafka, DB
- [ ] Trace context propagation (W3C TraceContext)
- [ ] Custom span yardımcıları (@Trace() decorator)
- [ ] Sampling konfigürasyonu (dev: %100, prod: %10)

## Metrics (Prometheus)
- [ ] MetricsModule
- [ ] /metrics endpoint her servise ekle
- [ ] Default Node.js metrikleri (GC, heap, event loop)
- [ ] Custom business metrikleri helper'ları
  - [ ] Counter (sipariş sayısı, hata sayısı)
  - [ ] Histogram (istek süresi, saga süresi)
  - [ ] Gauge (kuyruk derinliği, aktif bağlantı)

## Logging
- [x] LoggerModule (Pino)
- [x] JSON structured log formatı
- [x] Log seviyesi env'den al (LOG_LEVEL)
- [ ] Trace ID / span ID log'a otomatik ekle
- [ ] Hassas veri maskeleme (şifre, kart no)
- [ ] Request/response log middleware

## Health Checks
- [ ] HealthModule (@nestjs/terminus)
- [ ] /health endpoint (liveness)
- [ ] /ready endpoint (readiness)
- [ ] DB bağlantı kontrolü
- [ ] Kafka bağlantı kontrolü
- [ ] Redis bağlantı kontrolü

## Alerts (Hazırlık)
- [ ] Prometheus alert kuralları dosyası (infra/docker/prometheus/)
- [ ] DLQ doluluk alarmı
- [ ] Yüksek hata oranı alarmı
- [ ] Servis yanıt vermeme alarmı

## Tests
- [ ] Unit: log maskeleme, metric kayıt
- [ ] Integration: trace propagation

## Docs
- [ ] Yeni metrik ekleme rehberi
- [ ] Jaeger'da trace okuma rehberi
