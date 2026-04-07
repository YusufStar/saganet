# Monitoring & Observability Rehberi

## Servisler

| Araç | URL | Credentials |
|------|-----|-------------|
| Grafana | http://localhost:4000 | admin / admin |
| Prometheus | http://localhost:9090 | - |
| Jaeger | http://localhost:16686 | - |

## Grafana Dashboards

- **Saganet System Overview** — Tüm servislerin genel durumu, istek hızı, hata oranı
- **Saga Flow** — Sipariş saga akışı, başarı/başarısız oranı, işlem süresi

## Prometheus Metrikler

Her servis `/metrics` endpoint'i Prometheus formatında metrik sağlar.
Scrape konfigürasyonu: `infra/docker/prometheus.yml`

## OpenTelemetry Tracing

Tüm servisler Jaeger'a trace gönderir. `OTEL_EXPORTER_OTLP_ENDPOINT` env ile konfigüre edilir.

## Alert Kuralları

`infra/docker/prometheus-alerts.yml` dosyasında tanımlı:
- **ServiceDown** — Servis 1 dakikadan fazla yanıt vermezse CRITICAL
- **HighErrorRate** — 5xx hata oranı %5'i geçerse WARNING
- **HighPaymentFailureRate** — Ödeme başarısızlık oranı %10'u geçerse WARNING

## Yeni Metrik Ekleme

Servislerdeki `MetricsService`'e yeni Counter/Histogram/Gauge ekle, ardından Grafana'da panel oluştur.
