# Auth Service Flow

## Complete Authentication Flow

```mermaid
sequenceDiagram
    participant C as Client
    participant GW as API Gateway
    participant Auth as Auth Service
    participant DB as PostgreSQL
    participant R as Redis
    participant K as Kafka
    participant N as Notification Service

    %% Registration
    rect rgb(230, 245, 255)
    Note over C,N: Registration Flow
    C->>GW: POST /auth/register {email, password}
    GW->>Auth: Forward request
    Auth->>DB: Check email uniqueness
    Auth->>DB: Insert user (passwordHash=bcrypt, emailVerified=false)
    Auth->>DB: Insert outbox (user.registered)
    Auth-->>C: 201 {user, message}
    Note over DB,K: Outbox Relay (polls every 500ms)
    DB->>K: user.registered event
    K->>N: Deliver verification email
    end

    %% Email Verification
    rect rgb(230, 255, 230)
    Note over C,N: Email Verification Flow
    C->>GW: GET /auth/verify-email?token=UUID
    GW->>Auth: Forward request
    Auth->>DB: Find user by sha256(token)
    Auth->>DB: Set emailVerified=true, clear token
    Auth->>DB: Insert outbox (user.email-verified)
    Auth-->>C: 200 {message: "Email verified"}
    end

    %% Login
    rect rgb(255, 245, 230)
    Note over C,N: Login Flow
    C->>GW: POST /auth/login {email, password}
    GW->>Auth: Forward request
    Auth->>R: Check rate limit (IP + email)
    Auth->>DB: Find user by email
    Auth->>Auth: Check lockout, bcrypt.compare
    Auth->>Auth: Check emailVerified
    Auth->>DB: Create UserSession (refreshTokenHash)
    Auth->>R: SET session:{id} {userId, role}
    Auth->>R: SADD user:{id}:sessions
    Auth->>Auth: Sign JWT (sub, role, sessionId)
    Auth-->>C: 200 {access_token} + Set-Cookie: session_id, refresh_token
    end

    %% Token Verification (API Gateway)
    rect rgb(245, 230, 255)
    Note over C,N: Request Authentication (every API call)
    C->>GW: Any request + Bearer token + session_id cookie
    GW->>Auth: POST /auth/verify (token + session_id)
    Auth->>Auth: jwt.verify(accessToken)
    Auth->>R: GET session:{sessionId}
    Auth-->>GW: {userId, role, sessionId}
    GW->>GW: Set x-user-id, x-user-role headers
    GW->>GW: Forward to target service
    end

    %% Token Refresh
    rect rgb(255, 255, 230)
    Note over C,N: Token Refresh Flow
    C->>GW: POST /auth/refresh + cookies
    GW->>Auth: Forward (session_id, refresh_token cookies)
    Auth->>R: Check session exists
    Auth->>DB: Verify session not revoked/expired
    Auth->>Auth: bcrypt.compare(refreshToken, hash)
    Auth->>DB: Rotate refresh token (new hash)
    Auth->>R: Renew session TTL
    Auth->>Auth: Sign new JWT
    Auth-->>C: 200 {access_token} + Set-Cookie: refresh_token
    end

    %% Password Reset
    rect rgb(255, 230, 230)
    Note over C,N: Password Reset Flow
    C->>GW: POST /auth/forgot-password {email}
    GW->>Auth: Forward request
    Auth->>DB: Find user (no email enumeration)
    Auth->>DB: Save resetTokenHash + expiry (1h)
    Auth->>DB: Insert outbox (user.password-reset-requested)
    Auth-->>C: 200 {message} (always same response)
    DB->>K: user.password-reset-requested
    K->>N: Send reset email with token

    C->>GW: POST /auth/reset-password {token, newPassword}
    GW->>Auth: Forward request
    Auth->>DB: Find user by sha256(token), check expiry
    Auth->>Auth: bcrypt.hash(newPassword)
    Auth->>DB: Update passwordHash, clear reset fields
    Auth->>DB: Insert outbox (user.password-changed)
    Auth-->>C: 200 {message: "Password reset"}
    end

    %% Logout
    rect rgb(240, 240, 240)
    Note over C,N: Logout Flow
    C->>GW: POST /auth/logout + cookies
    GW->>Auth: Forward request
    Auth->>DB: Set revokedAt on session
    Auth->>R: DEL session:{id}
    Auth->>R: SREM user:{id}:sessions
    Auth-->>C: 204 + Clear cookies
    end
```

## Security Features

- **Password Strength**: Minimum 8 characters, requires uppercase, lowercase, number, and special character
- **Rate Limiting**: Redis sliding window (30 req/15min per IP, 10 req/15min per email)
- **Account Lockout**: 5 failed attempts triggers 15-minute lockout
- **Refresh Token Rotation**: New token issued on each refresh, old token invalidated
- **Token Family Tracking**: Reuse of old refresh token revokes entire session family
- **No Email Enumeration**: Forgot-password always returns same response
- **Outbox Pattern**: Guaranteed event delivery via transactional outbox + Kafka relay
