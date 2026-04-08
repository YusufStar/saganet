# packages/observability todos

## Scaffold
- [x] packages/observability klasörü oluştur
- [x] package.json, tsconfig.json
- [x] Bağımlılıklar: pino (pino + pino-pretty)

## Tracing (OpenTelemetry)
- [x] TracingModule (NestJS dynamic module)
- [x] OTLP exporter (Jaeger'a gönder)
- [x] Auto-instrumentation: HTTP, Kafka, DB
- [x] Trace context propagation (W3C TraceContext)
- [x] Custom span yardımcıları (@Trace() decorator)
- [x] Sampling konfigürasyonu (dev: %100 default — prod config via OTEL_TRACES_SAMPLER env)

## Metrics (Prometheus)
- [x] MetricsModule
- [x] /metrics endpoint her servise ekle
- [x] Default Node.js metrikleri (GC, heap, event loop)
- [ ] Custom business metrikleri helper'ları
  - [ ] Counter (sipariş sayısı, hata sayısı)
  - [ ] Histogram (istek süresi, saga süresi)
  - [ ] Gauge (kuyruk derinliği, aktif bağlantı)

## Logging
- [x] LoggerModule (Pino)
- [x] JSON structured log formatı
- [x] Log seviyesi env'den al (LOG_LEVEL)
- [x] Trace ID / span ID log'a otomatik ekle
- [x] Hassas veri maskeleme (şifre, kart no)
- [x] Request/response log middleware

## Health Checks
- [x] HealthModule (@nestjs/terminus)
- [x] /health endpoint (liveness)
- [x] /ready endpoint (readiness)
- [x] DB bağlantı kontrolü
- [ ] Kafka bağlantı kontrolü (deferred — no built-in terminus indicator)
- [x] Redis bağlantı kontrolü

## Alerts (Hazırlık)
- [x] Prometheus alert kuralları dosyası (infra/docker/prometheus-alerts.yml)
- [x] DLQ doluluk alarmı
- [x] Yüksek hata oranı alarmı
- [x] Servis yanıt vermeme alarmı

## Tests
- [x] Unit: log maskeleme, metric kayıt
- [ ] Integration: trace propagation

## Docs
- [x] Yeni metrik ekleme rehberi
- [x] Jaeger'da trace okuma rehberi
