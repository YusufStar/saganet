# infra todos

## Docker
- [ ] Her servis için Dockerfile yaz (multi-stage build)
- [ ] .dockerignore ekle
- [x] docker-compose.yml: tüm servisler + infra
  - [x] PostgreSQL
  - [x] Kafka + Zookeeper
  - [x] Redis
  - [x] Jaeger
  - [x] Prometheus
  - [x] Grafana
- [ ] docker-compose.override.yml (geliştirme overrides)
- [ ] docker-compose.test.yml (entegrasyon testleri için)
- [x] Health check tanımları compose'a ekle

## Kubernetes (ilerleyen aşama)
- [ ] Her servis için Deployment manifest
- [ ] Her servis için Service manifest
- [ ] ConfigMap (env değişkenleri)
- [ ] Secret (hassas değerler)
- [ ] Ingress (api-gateway)
- [ ] HorizontalPodAutoscaler
- [ ] PodDisruptionBudget
- [ ] Kafka: Strimzi operatörü
- [ ] Namespace yapısı: dev / staging / prod

## CI/CD
- [x] .github/workflows/ci.yml
  - [x] Lint
  - [x] Type check
  - [x] Unit testleri
  - [x] Build
- [ ] .github/workflows/integration-tests.yml
  - [ ] Docker Compose ayağa kaldır
  - [ ] E2E testleri çalıştır
- [ ] .github/workflows/release.yml
  - [ ] Tag push'ta Docker image build + push
  - [ ] Semantic versioning (standard-version)

## Environment
- [x] .env.example dosyası (tüm değişkenler, değersiz)
- [ ] Her ortam için env template: .env.dev, .env.test
- [ ] Secrets yönetimi stratejisi belirle (Vault / AWS Secrets Manager)

## Monitoring Stack
- [x] Prometheus scrape config (her servis /metrics)
- [ ] Grafana dashboard JSON'ları
  - [ ] Genel sistem dashboard
  - [ ] Saga akış dashboard
  - [ ] Kafka consumer lag dashboard
- [x] Jaeger all-in-one konfigürasyonu

## Chaos Mode
- [ ] npm run chaos script'i implement et
  - [ ] Rastgele servis durdur (docker stop)
  - [ ] Network gecikme enjekte et (tc netem)
  - [ ] Kafka mesaj kaybı simülasyonu
- [ ] Chaos test senaryoları belgele

## Docs
- [ ] Yerel geliştirme kurulum rehberi
- [ ] Kubernetes deploy rehberi
- [ ] Monitoring stack kullanım rehberi
