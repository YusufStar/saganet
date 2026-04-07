# infra todos

## Docker
- [ ] Her servis için Dockerfile yaz (multi-stage build)
- [ ] .dockerignore ekle
- [ ] docker-compose.yml: tüm servisler + infra
  - [ ] PostgreSQL
  - [ ] Kafka + Zookeeper (veya KRaft)
  - [ ] Redis
  - [ ] Jaeger
  - [ ] Prometheus
  - [ ] Grafana
- [ ] docker-compose.override.yml (geliştirme overrides)
- [ ] docker-compose.test.yml (entegrasyon testleri için)
- [ ] Health check tanımları compose'a ekle

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
- [ ] .github/workflows/ci.yml
  - [ ] Lint
  - [ ] Type check
  - [ ] Unit testleri
  - [ ] Build
- [ ] .github/workflows/integration-tests.yml
  - [ ] Docker Compose ayağa kaldır
  - [ ] E2E testleri çalıştır
- [ ] .github/workflows/release.yml
  - [ ] Tag push'ta Docker image build + push
  - [ ] Semantic versioning (standard-version)

## Environment
- [ ] .env.example dosyası (tüm değişkenler, değersiz)
- [ ] Her ortam için env template: .env.dev, .env.test
- [ ] Secrets yönetimi stratejisi belirle (Vault / AWS Secrets Manager)

## Monitoring Stack
- [ ] Prometheus scrape config (her servis /metrics)
- [ ] Grafana dashboard JSON'ları
  - [ ] Genel sistem dashboard
  - [ ] Saga akış dashboard
  - [ ] Kafka consumer lag dashboard
- [ ] Jaeger all-in-one konfigürasyonu

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
