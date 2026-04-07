# infra todos

## Docker
- [x] Her servis için Dockerfile yaz (multi-stage build)
- [x] .dockerignore ekle
- [x] docker-compose.yml: tüm servisler + infra
  - [x] PostgreSQL
  - [x] Kafka + Zookeeper
  - [x] Redis
  - [x] Jaeger
  - [x] Prometheus
  - [x] Grafana
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
- [x] .github/workflows/integration-tests.yml
  - [x] Docker Compose ayağa kaldır
  - [x] E2E testleri çalıştır
- [x] .github/workflows/release.yml
  - [x] Tag push'ta Docker image build + push
  - [x] Semantic versioning (standard-version)

## Environment
- [x] .env.example dosyası (tüm değişkenler, değersiz)
- [x] Her ortam için env template: .env.dev, .env.test
- [x] Secrets yönetimi stratejisi belirle (Vault / AWS Secrets Manager)

## Monitoring Stack
- [x] Prometheus scrape config (her servis /metrics)
- [x] Grafana dashboard JSON'ları
  - [x] Genel sistem dashboard
  - [x] Saga akış dashboard
  - [ ] Kafka consumer lag dashboard
- [x] Jaeger all-in-one konfigürasyonu
- [x] Prometheus alert kuralları dosyası

## Chaos Mode
- [ ] npm run chaos script'i implement et
  - [ ] Rastgele servis durdur (docker stop)
  - [ ] Network gecikme enjekte et (tc netem)
  - [ ] Kafka mesaj kaybı simülasyonu
- [ ] Chaos test senaryoları belgele

## Docs
- [x] Yerel geliştirme kurulum rehberi
- [ ] Kubernetes deploy rehberi
- [x] Monitoring stack kullanım rehberi
