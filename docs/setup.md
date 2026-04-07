# Saganet — Developer Setup Guide

## Requirements

- Node.js 25+
- pnpm 10+
- Docker & Docker Compose

## 1. Install Dependencies

```bash
pnpm install
```

## 2. Configure Environment Variables

Copy the root `.env.example`:

```bash
cp .env.example .env
```

> All services read from the root `.env` file.
> For service-specific overrides, create `apps/<service>/.env.local`.

## 3. Start Infrastructure (Docker)

```bash
cd infra/docker
sudo docker compose up -d
```

Services started:

| Service     | Address                        |
|-------------|-------------------------------|
| PostgreSQL  | localhost:5432                |
| Redis       | localhost:6379                |
| Kafka       | localhost:9092                |
| Jaeger UI   | http://localhost:16686        |
| Prometheus  | http://localhost:9090         |
| Grafana     | http://localhost:4000         |

## 4. Run Migrations

> **Important:** `pnpm dev` does NOT run migrations automatically.
> Run them manually before starting a service.

### auth-service

```bash
cd apps/auth-service
pnpm migration:run
```

Migrations applied (in order):
1. `CreateUsersTable` — users, roles, email verification
2. `CreateUserSessionsTable` — session tracking, refresh token hashes
3. `CreateUserOAuthAccountsTable` — Google/GitHub OAuth accounts
4. `CreateOutboxTable` — reliable event publishing
5. `AddEmailVerificationToUsers` — email verification token + expiry
6. `AddLoginSecurityFields` — failed login counter, family ID for token reuse detection

### catalog-service

```bash
cd apps/catalog-service
pnpm migration:run
```

Migrations applied (in order):
1. `CreateCategoriesTable` — categories, self-referential tree (parentId)
2. `CreateProductsTable` — products, vendorId, status, price, indexes
3. `CreateProductImagesTable` — product images, CASCADE delete

### Revert last migration

```bash
pnpm migration:revert
```

## 5. Start Services

```bash
# Single service
cd apps/auth-service && pnpm dev

# From root
pnpm dev
```

## 6. API Documentation (Swagger)

Swagger UI is only available when `NODE_ENV !== production`.

| Service       | URL                            |
|---------------|-------------------------------|
| auth-service  | http://localhost:3001/docs    |
| api-gateway   | http://localhost:3000/docs    |

## 7. Auth Flow

### Register → Verify → Login

```
POST /api/auth/register        { email, password }
  → 201: { user, message }
  → Sends verification email (via Kafka outbox → notification-service)

GET  /api/auth/verify-email?token=<token>
  → 200: { message }
  → Sends welcome email

POST /api/auth/login           { email, password }
  → 200: { access_token, user }
  → Sets cookies: session_id, refresh_token (httpOnly, sameSite=lax)
```

### Session Management

```
POST /api/auth/refresh
  → Reads: session_id + refresh_token cookies
  → 200: { access_token }
  → Rotates refresh_token cookie (reuse detection active)

POST /api/auth/logout
  → Revokes current session, clears cookies

POST /api/auth/logout/all
  → Revokes all sessions for the user (requires x-user-id header from api-gateway)
```

### Security Notes

- **Rate limiting**: 30 attempts / 15 min per IP, 10 per email (Redis sliding window)
- **Account lockout**: 5 failed attempts → 15 min lockout
- **Refresh token rotation**: every refresh issues a new token, old one is invalidated
- **Reuse detection**: using a stolen old refresh token revokes the entire session family
- **Device check**: user-agent change during refresh revokes the session

### Authenticated Requests

After login, include the access token in every request:

```
Authorization: Bearer <access_token>
```

The api-gateway validates it and forwards `x-user-id`, `x-user-role`, `x-session-id` headers to downstream services.

---

## Outbox Pattern

Outbox is used to reliably deliver events to Kafka:

```
[Service Transaction]
  DB transaction opens
  → Business data saved (e.g. new user)
  → Event written to outbox table  ← same transaction
  DB transaction commits

[Outbox Relay Worker]  (to be implemented)
  → Polls outbox table (sentAt IS NULL)
  → Publishes to Kafka
  → Updates sentAt
```

**Why it matters:**
Direct Kafka publish risks: DB commit succeeds but Kafka publish fails.
With Outbox: both are saved or neither — atomic guarantee.
