# api-gateway todos

## Scaffold
- [x] NestJS projesi oluştur
- [x] Monorepo'ya ekle (apps/api-gateway)
- [x] package.json, tsconfig.json ayarla

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
- [x] JWT verification middleware (Bearer token → Redis session check)
- [x] Public/protected route separation (register, login, health, docs excluded)
- [x] Attach x-user-id, x-user-role, x-session-id headers to forwarded requests
- [ ] Token refresh flow routing

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
- [x] Health check endpoint (/health, /ready)

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
