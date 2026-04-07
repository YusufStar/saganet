# auth-service todos

## Scaffold
- [x] NestJS projesi oluştur
- [x] apps/auth-service klasörüne ekle
- [ ] Gerekli bağımlılıklar: @nestjs/jwt, bcrypt, passport

## User Management
- [ ] User entity / schema tasarla (id, email, passwordHash, role, createdAt)
- [ ] Register endpoint (POST /auth/register)
- [ ] Login endpoint (POST /auth/login)
- [ ] Logout / token invalidation
- [ ] Email doğrulama akışı

## JWT
- [ ] Access token üretimi (kısa ömürlü, ~15dk)
- [ ] Refresh token üretimi (uzun ömürlü, ~7gün)
- [ ] Refresh token rotation
- [ ] Token blacklist (Redis)
- [ ] Token doğrulama servisi (api-gateway'e expose)

## Password
- [ ] bcrypt ile hash
- [ ] Şifre sıfırlama akışı (e-posta ile)
- [ ] Şifre güç kuralları (validation)

## Roles & Permissions
- [ ] Rol tanımla: ADMIN, CUSTOMER, VENDOR
- [ ] RolesGuard yaz
- [ ] @Roles() decorator

## Database
- [ ] PostgreSQL bağlantısı (TypeORM veya Prisma)
- [ ] Migration: users tablosu
- [ ] Migration: refresh_tokens tablosu
- [ ] Outbox tablosu (user.registered event için)

## Kafka Events
- [ ] user.registered event yayınla (outbox üzerinden)
- [ ] user.password-changed event yayınla

## Observability
- [ ] OpenTelemetry tracing
- [ ] Login başarı/başarısız metrikleri
- [ ] Structured JSON log
- [ ] /health endpoint

## Tests
- [ ] Unit: JWT servisi, şifre hashing
- [ ] Integration: register → login akışı
- [ ] E2E: token yenileme

## Docs
- [ ] Swagger endpoint'leri aç
- [ ] Auth akış diyagramı (docs/ altına)
