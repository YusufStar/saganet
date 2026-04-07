# auth-service todos

## Sistem Mimarisi

```
[Browser]
   ↓ cookie (refresh_token) / Authorization: Bearer <access_token>
[API Gateway]
   ↓ JWT doğrula → geçersizse 401
   ↓ user context'i header'a ekle (x-user-id, x-user-role)
[Order Service]
   ↓ iş mantığı tamamlanınca event üret
[Kafka]  →  topic: order.created
   ↓
[Inventory Service]
   ↓ stok güncelle
```

Auth service bu akışta **token üretimi ve doğrulamasından** sorumludur.
API Gateway, her istekte auth-service'in `/auth/verify` endpoint'ini çağırır.

## Scaffold
- [x] NestJS projesi oluştur
- [x] apps/auth-service klasörüne ekle
- [x] Gerekli bağımlılıklar: @nestjs/jwt, bcrypt, passport

## User Management
- [x] User entity / schema tasarla (id, email, passwordHash, role, createdAt)
- [ ] Register endpoint (POST /auth/register)
- [ ] Login endpoint (POST /auth/login)
- [ ] Logout / token invalidation
- [ ] Email doğrulama akışı

## Session Modeli (better-auth tarzı)

Mimari:
- Her login → yeni `UserSessionEntity` (PostgreSQL) + Redis cache
- Refresh token session'a bağlı, DB'de bcrypt hash olarak saklanır
- Session ID cookie'de (httpOnly, secure, sameSite=strict)
- Redis hem hız hem anlık invalidation sağlar

```
[Login]
  → UserSessionEntity oluştur (DB)
  → session:{sessionId} → { userId, role } set (Redis, TTL=7gün)
  → user:{userId}:sessions → sessionId ekle (Redis SET)
  → access_token (JWT, 15dk) + session_id (cookie) döndür

[Token Refresh]
  → Cookie'den sessionId al
  → Redis'te session:{sessionId} var mı? → yoksa 401
  → DB'de revokedAt null, expiresAt > now mı? → hayırsa 401
  → refreshTokenHash bcrypt verify → yanlışsa 401
  → Yeni access_token + yeni refreshToken üret (rotation)
  → DB refreshTokenHash güncelle, lastActiveAt güncelle
  → Redis TTL yenile

[Logout (tek cihaz)]
  → session:{sessionId} Redis'ten sil
  → user:{userId}:sessions → sessionId çıkar
  → DB revokedAt set

[Logout (tüm cihazlar)]
  → user:{userId}:sessions tüm sessionId'leri al
  → Hepsini Redis'ten sil
  → DB: userId'ye ait tüm aktif session'ları revoke et

[Cihazları listele]
  → user:{userId}:sessions → Redis SET → her biri için session:{id} detayı
  → Fallback: DB sorgusu
```

### UserSessionEntity (PostgreSQL)
- [x] id (uuid, PK)
- [x] userId (FK → users, CASCADE DELETE)
- [x] refreshTokenHash (bcrypt hash)
- [x] userAgent (nullable)
- [x] ipAddress (nullable)
- [x] lastActiveAt
- [x] expiresAt (session mutlak bitiş)
- [x] revokedAt (nullable, manuel iptal)

### Redis Yapısı
- [ ] `session:{sessionId}` → `{ userId, role, sessionId }` (TTL = expiresAt)
- [ ] `user:{userId}:sessions` → Redis SET (aktif sessionId'ler)

## JWT
- [ ] Access token üretimi (kısa ömürlü, ~15dk) — payload: { sub, role, sessionId }
- [ ] Refresh token üretimi (uzun ömürlü, ~7gün) — session'a bağlı, rotation ile
- [ ] Refresh token rotation (her refresh'te yeni token, eski hash güncellenir)
- [ ] Token doğrulama servisi (api-gateway'e expose) — Redis'e bakarak anlık kontrol

## Password
- [ ] bcrypt ile hash
- [ ] Şifre sıfırlama akışı (e-posta ile)
- [ ] Şifre güç kuralları (validation)

## Roles & Permissions
- [x] Rol tanımla: ADMIN, CUSTOMER, VENDOR
- [ ] RolesGuard yaz
- [ ] @Roles() decorator

## Database
- [ ] PostgreSQL bağlantısı (TypeORM veya Prisma)
- [ ] Migration: users tablosu
- [x] Migration: user_sessions tablosu (UserSessionEntity)
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
