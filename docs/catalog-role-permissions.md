# Catalog Service — Rol-İzin Matrisi

## Endpoint İzinleri

| Endpoint                              | PUBLIC | CUSTOMER | VENDOR      | ADMIN |
|---------------------------------------|--------|----------|-------------|-------|
| GET /products                         | ✅     | ✅       | ✅          | ✅    |
| GET /products/:id                     | ✅     | ✅       | ✅          | ✅    |
| GET /categories                       | ✅     | ✅       | ✅          | ✅    |
| GET /categories/:id/products          | ✅     | ✅       | ✅          | ✅    |
| POST /vendor/products                 | ❌     | ❌       | ✅          | ✅    |
| GET /vendor/products                  | ❌     | ❌       | ✅ (kendi)  | ✅    |
| PATCH /vendor/products/:id            | ❌     | ❌       | ✅ (kendi)  | ✅    |
| DELETE /vendor/products/:id           | ❌     | ❌       | ✅ (kendi)  | ✅    |
| POST /vendor/products/:id/images      | ❌     | ❌       | ✅ (kendi)  | ✅    |
| GET /admin/products                   | ❌     | ❌       | ❌          | ✅    |
| POST /admin/products                  | ❌     | ❌       | ❌          | ✅    |
| PATCH /admin/products/:id             | ❌     | ❌       | ❌          | ✅    |
| DELETE /admin/products/:id            | ❌     | ❌       | ❌          | ✅    |
| PATCH /admin/products/:id/approve     | ❌     | ❌       | ❌          | ✅    |
| PATCH /admin/products/:id/reject      | ❌     | ❌       | ❌          | ✅    |
| PATCH /admin/products/:id/suspend     | ❌     | ❌       | ❌          | ✅    |
| POST /admin/categories                | ❌     | ❌       | ❌          | ✅    |
| PATCH /admin/categories/:id           | ❌     | ❌       | ❌          | ✅    |
| DELETE /admin/categories/:id          | ❌     | ❌       | ❌          | ✅    |

## Güvenlik Kontrolleri

1. **RolesGuard**: `x-user-role` header'ından rol okunur (API Gateway JWT doğrulaması sonrası set eder)
2. **OwnershipGuard**: Vendor endpoint'lerinde `vendorId === x-user-id` kontrolü (403 Forbidden)
3. **InternalAuthMiddleware**: `x-user-id`/`x-user-role` sadece `x-internal-secret` eşleşirse kabul edilir
4. **Rate Limiting**: `POST /vendor/products` → 100 istek/saat per vendor
