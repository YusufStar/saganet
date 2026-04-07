# api-gateway todos

## Scaffold
- [ ] NestJS projesi oluştur
- [ ] Monorepo'ya ekle (apps/api-gateway)
- [ ] package.json, tsconfig.json ayarla

## Routing & Proxy
- [ ] HTTP proxy middleware kur (http-proxy-middleware veya custom)
- [ ] Her servis için route tanımla
  - [ ] /orders → order-service
  - [ ] /auth → auth-service
  - [ ] /catalog → catalog-service
  - [ ] /inventory → inventory-service
  - [ ] /payments → payment-service
- [ ] Route config'i environment-based yap

## Auth Middleware
- [ ] JWT doğrulama middleware'i yaz
- [ ] Public/protected route ayrımı
- [ ] Token refresh akışını yönlendir

## Rate Limiting
- [ ] Global rate limiter ekle
- [ ] Endpoint bazlı limit konfigürasyonu
- [ ] Redis-backed rate limiting (distributed)

## Request Validation
- [ ] Global validation pipe
- [ ] Request ID header inject et
- [ ] Content-Type kontrolü

## Observability
- [ ] OpenTelemetry tracing entegrasyonu
- [ ] Her isteğe trace-id / span-id ekle
- [ ] Request/response log middleware
- [ ] Prometheus metrics endpoint (/metrics)
- [ ] Health check endpoint (/health, /ready)

## Error Handling
- [ ] Global exception filter
- [ ] Downstream servis hata dönüşümü
- [ ] 502/503 için fallback response

## Tests
- [ ] Unit: middleware ve filter testleri
- [ ] E2E: temel route yönlendirme testleri

## Docs
- [ ] Swagger/OpenAPI entegrasyonu
- [ ] Route listesi README'ye ekle
