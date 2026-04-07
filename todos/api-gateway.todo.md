# api-gateway todos

## Scaffold

- [x] NestJS projesi oluştur
- [x] Monorepo'ya ekle (apps/api-gateway)
- [x] package.json, tsconfig.json ayarla

## Routing & Proxy

- [x] HTTP proxy middleware kur (http-proxy-middleware veya custom)
- [x] Her servis için route tanımla
  - [x] /orders → order-service
  - [x] /auth → auth-service
  - [x] /catalog → catalog-service
  - [x] /inventory → inventory-service
  - [x] /payments → payment-service
- [x] Route config'i environment-based yap

## Auth Middleware

- [x] JWT verification middleware (Bearer token → Redis session check)
- [x] Public/protected route separation (register, login, health, docs excluded)
- [x] Attach x-user-id, x-user-role, x-session-id headers to forwarded requests
- [x] Token refresh flow routing

## Rate Limiting

- [x] Global rate limiter ekle
- [x] Endpoint bazlı limit konfigürasyonu
- [x] Redis-backed rate limiting (distributed)

## Request Validation

- [x] Global validation pipe
- [x] Request ID header inject et
- [x] Content-Type kontrolü

## Observability

- [x] OpenTelemetry tracing entegrasyonu
- [x] Her isteğe trace-id / span-id ekle
- [x] Request/response log middleware
- [x] Prometheus metrics endpoint (/metrics)
- [x] Health check endpoint (/health, /ready)

## Error Handling

- [x] Global exception filter
- [x] Downstream servis hata dönüşümü
- [x] 502/503 için fallback response

## Tests

- [x] Unit: middleware ve filter testleri
- [x] E2E: temel route yönlendirme testleri

## Docs

- [x] Swagger/OpenAPI entegrasyonu (dev modda /docs, Bearer + Cookie auth)
