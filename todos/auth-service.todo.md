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

- [x] User entity / schema tasarla (id, email, passwordHash?, role, createdAt)
- [x] Register endpoint (POST /auth/register)
- [x] Login endpoint (POST /auth/login)
- [x] Logout / token invalidation (POST /auth/logout, POST /auth/logout/all)
- [x] Email verification flow (token generation, verify-email endpoint, outbox → welcome email)

## User Profile & Addresses

- [x] `GET /auth/profile` — mevcut kullanıcı profilini getir (displayName, avatarUrl, email, role)
- [x] `PATCH /auth/profile` — displayName güncelle
- [x] `POST /auth/profile/avatar` — avatar yükle (JPEG/PNG/WebP, max 5MB, magic bytes kontrolü, MinIO)
- [x] `GET /auth/addresses` — kayıtlı adresleri listele (default önce)
- [x] `POST /auth/addresses` — yeni adres ekle (max 5 adres/kullanıcı)
- [x] `PATCH /auth/addresses/:id` — adres güncelle (sahiplik kontrolü)
- [x] `PATCH /auth/addresses/:id/default` — varsayılan adres yap
- [x] `DELETE /auth/addresses/:id` — adres sil (sahiplik kontrolü)
- [x] Migration: `displayName`, `avatarUrl` → users tablosuna eklendi
- [x] Migration: `user_addresses` tablosu (label, fullName, city, isDefault...)
- [x] `@saganet/storage` entegrasyonu (MinIO avatar upload)
- [x] Magic bytes doğrulaması (Content-Type header'ına güvenme)

> **Not:** Adresler yalnızca form pre-fill shortcut'ıdır. Sipariş sisteminde `addressId` FK kullanılmaz — adres verisi snapshot olarak kopyalanır.

## OAuth

Akış (Google örneği):

```
GET /auth/google → Google OAuth consent
GET /auth/google/callback?code=...
  → code ile token exchange (Google API)
  → provider + providerAccountId ile UserOAuthAccountEntity ara
  → Bulunamadıysa: yeni User (passwordHash=null) + OAuthAccount oluştur
  → UserSession oluştur (aynı session mekanizması)
  → access_token döndür, session cookie set
```

### UserOAuthAccountEntity (PostgreSQL)

- [x] id (uuid, PK)
- [x] userId (FK → users, CASCADE DELETE)
- [x] provider (enum: GOOGLE, GITHUB)
- [x] providerAccountId (provider'ın user ID'si, unique per provider)
- [x] accessToken (nullable)
- [x] refreshToken (nullable)
- [x] accessTokenExpiresAt (nullable)
- [x] scope (nullable)

### Implementasyon

- [ ] `@nestjs/passport` + `passport-google-oauth20` entegrasyonu
- [ ] `GoogleStrategy` (passport strategy)
- [ ] `GET /auth/google` → redirect
- [ ] `GET /auth/google/callback` → OAuthService.handleCallback()
- [ ] OAuthService: upsert user + account, session oluştur
- [ ] GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_CALLBACK_URL env

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

- [x] `session:{sessionId}` → `{ userId, role, sessionId }` (TTL = expiresAt)
- [x] `user:{userId}:sessions` → Redis SET (aktif sessionId'ler)

## JWT & Session (login'de oluşturulacak — 3'lü birlikte)

Session token üçlüsü login endpoint'inde set edilecek:

- `access_token` (JWT, 15min) → response body
- `session_id` cookie → UUID of UserSessionEntity (Redis key for fast lookup)
- `refresh_token` cookie → raw UUID secret, stored hashed in DB, used to issue new access_token

- [x] Access token generation (~15min) — payload: { sub, role, sessionId }
- [x] Refresh token generation (~7 days) — bound to session, rotation on each use
- [x] Refresh token rotation (new token on each refresh, old hash updated)
- [x] Token verification endpoint (exposed to api-gateway) — Redis session check

## Password

- [x] bcrypt ile hash
- [x] Şifre sıfırlama akışı (e-posta ile)
- [x] Şifre güç kuralları (validation)

## Roles & Permissions

- [x] Rol tanımla: ADMIN, CUSTOMER, VENDOR
- [x] RolesGuard yaz
- [x] @Roles() decorator

## Database

- [x] PostgreSQL bağlantısı (TypeORM veya Prisma)
- [x] Migration: users tablosu
- [x] Migration: user_sessions tablosu
- [x] Migration: user_oauth_accounts tablosu
- [x] Outbox tablosu (user.registered event için)

## Kafka Events

- [x] user.registered event yayınla (outbox üzerinden)
- [x] user.password-changed event yayınla

## Observability

- [x] OpenTelemetry tracing
- [x] Login başarı/başarısız metrikleri
- [x] Structured JSON log
- [x] /health endpoint

## Tests

- [x] Unit: JWT servisi, şifre hashing
- [x] Integration: register → login akışı
- [x] E2E: token yenileme

## Docs

- [x] Swagger endpoint'leri aç (dev modda /docs, Bearer + Cookie auth)
- [x] Auth akış diyagramı (docs/ altına)
- [x] docs/setup.md — migration kurulum notu, outbox açıklaması
