# catalog-service todos

## Sistem Mimarisi & Rol Modeli

```
[Public]     GET /products, GET /products/:id, GET /categories      → herkes
[VENDOR]     POST/PATCH/DELETE /vendor/products (sadece kendi ürünleri)
[ADMIN]      POST/PATCH/DELETE /admin/products  (tüm ürünler)
[ADMIN]      POST/PATCH/DELETE /admin/categories
```

### Ürün Yaşam Döngüsü (Güvenlik Kritik)

```
VENDOR ürün ekler
  → status: PENDING_REVIEW
  → ADMIN onaylayana kadar public listede görünmez
  → ADMIN: APPROVE → ACTIVE (görünür)
  → ADMIN: REJECT  → REJECTED (vendora bildirim)
  → ADMIN: SUSPEND → SUSPENDED (yayından kaldır)
```

### Rol İzinleri Matrisi

| İşlem                        | CUSTOMER | VENDOR       | ADMIN |
|------------------------------|----------|--------------|-------|
| Ürün listele (public)        | ✅       | ✅           | ✅    |
| Ürün detay (public)          | ✅       | ✅           | ✅    |
| Ürün ekle                    | ❌       | ✅           | ✅    |
| Ürün düzenle (kendi)         | ❌       | ✅           | ✅    |
| Ürün düzenle (başkasının)    | ❌       | ❌ (403)     | ✅    |
| Ürün sil (kendi)             | ❌       | Soft delete  | ✅    |
| Ürün onaylama / askıya alma  | ❌       | ❌           | ✅    |
| Kategori yönetimi            | ❌       | ❌           | ✅    |

---

## Scaffold

- [x] NestJS projesi oluştur
- [x] apps/catalog-service klasörüne ekle
- [x] Bağımlılıklar: TypeORM/Prisma, class-validator, class-transformer

---

## Product Domain

### Entity Tasarımı

- [x] Product entity:
  - `id` (uuid, PK)
  - `vendorId` (uuid, FK → users — ürün sahibi)
  - `name`, `description`, `slug` (unique)
  - `price` (decimal, pozitif zorunlu)
  - `categoryId` (FK → categories)
  - `status` (enum: PENDING_REVIEW, ACTIVE, REJECTED, SUSPENDED, DELETED)
  - `rejectionReason` (nullable — ADMIN reddedince doldurulur)
  - `createdAt`, `updatedAt`, `deletedAt` (soft delete)
- [x] Category entity (id, name, slug, parentId — ağaç yapısı)
- [x] Slug üretimi (SEO-friendly, unique constraint)
- [x] Soft delete (`deletedAt` — vendor kendi ürününü siler, ADMIN hard delete yapabilir)

### Public Endpoint'ler (auth gerektirmez)

- [x] `GET /products` — sadece `status=ACTIVE` olanları döndür
- [x] `GET /products/:id` — sadece `status=ACTIVE` olanı döndür
- [x] `GET /categories` — tüm kategoriler
- [x] `GET /categories/:id/products` — kategoriye ait aktif ürünler

### Vendor Endpoint'leri (`@Roles(VENDOR)` + Ownership Guard)

- [x] `POST /vendor/products` — ürün ekle (status=PENDING_REVIEW otomatik set edilir, vendor değiştiremez)
- [x] `GET /vendor/products` — kendi ürünlerini listele (tüm status'lar)
- [x] `PATCH /vendor/products/:id` — kendi ürününü düzenle
  - **Güvenlik:** `vendorId === req.user.id` kontrolü (OwnershipGuard)
  - **Güvenlik:** `status`, `vendorId`, `rejectionReason` alanlarını VENDOR değiştiremez
  - Düzenleme sonrası status tekrar PENDING_REVIEW'a döner
- [x] `DELETE /vendor/products/:id` — soft delete (sadece kendi ürünü, status=DELETED)

### Admin Endpoint'leri (`@Roles(ADMIN)`)

- [x] `GET /admin/products` — tüm ürünler (tüm status'lar, tüm vendor'lar)
- [x] `POST /admin/products` — admin doğrudan ACTIVE ürün ekleyebilir
- [x] `PATCH /admin/products/:id` — herhangi bir ürünü düzenle
- [x] `DELETE /admin/products/:id` — hard delete
- [x] `PATCH /admin/products/:id/approve` — status → ACTIVE
- [x] `PATCH /admin/products/:id/reject` — status → REJECTED + rejectionReason zorunlu
- [x] `PATCH /admin/products/:id/suspend` — status → SUSPENDED
- [x] `POST /admin/categories` — kategori ekle
- [x] `PATCH /admin/categories/:id` — kategori düzenle
- [x] `DELETE /admin/categories/:id` — kategori sil

---

## Güvenlik

- [x] **OwnershipGuard**: `vendorId === req.user.id` — her VENDOR işleminde kontrol et, 403 dön
- [x] **DTO kısıtlamaları:**
  - `price` → `@IsPositive()`, `@Min(0.01)`, max sınır (örn. 1_000_000)
  - `vendorId` → VENDOR DTO'sunda hiç bulunmasın (backend set eder, `req.user.id`)
  - `status` → VENDOR DTO'sunda hiç bulunmasın
  - `rejectionReason` → sadece Admin DTO'sunda
- [x] **Header doğrulama:** `x-user-id`, `x-user-role` headerları API Gateway'den gelir — doğrudan dışarıdan kabul etme
- [x] **Input sanitization:** `description` alanı HTML strip (XSS)
- [x] **Görsel upload güvenliği:** magic bytes + MIME check + 5MB limit
- [x] **Rate limiting:** vendor ürün ekleme endpoint'ine limit (örn. 100 ürün/saat)

---

## Arama & Filtreleme

- [x] Fiyat aralığı filtresi (`minPrice`, `maxPrice`)
- [x] Kategori filtresi
- [x] Vendor filtresi (admin için)
- [x] Status filtresi (admin: tümü, vendor: kendi, public: yalnızca ACTIVE)
- [x] Fulltext arama (PostgreSQL `tsvector`)
- [x] Sıralama: fiyat, tarih, ad
- [x] Cursor-based pagination

---

## Görsel / Medya

- [x] Ürün görseli upload endpoint'i (`POST /vendor/products/:id/images`)
  - [x] **Güvenlik:** `vendorId` ownership kontrolü
  - [x] **Güvenlik:** Sadece `image/jpeg`, `image/png`, `image/webp` kabul et (MIME type doğrula)
  - [x] **Güvenlik:** Max dosya boyutu: 5MB
  - [x] **Güvenlik:** Dosya adı sanitize (path traversal önleme)
  - [x] **Güvenlik:** Magic bytes kontrolü (Content-Type header'ına güvenme)
- [x] Görsel boyutlandırma (thumbnail, full) — sharp ile resize

---

## Database

- [x] Migration: `products` tablosu (`vendorId`, `status`, `rejectionReason` dahil)
- [x] Migration: `categories` tablosu
- [x] Migration: `product_images` tablosu
- [x] Index: `price`, `category_id`, `vendor_id`, `status`, `created_at`
- [x] Composite index: `(vendor_id, status)` — vendor kendi ürünlerini sorgularken

---

## Kafka Events

- [x] `product.created` event yayınla (vendorId dahil)
- [x] `product.approved` event yayınla (inventory-service stok kaydı açabilir)
- [x] `product.price-changed` event yayınla
- [x] `product.suspended` event yayınla
- [x] `product.deleted` event yayınla
- [x] `stock.updated` event'ini inventory-service'ten dinle

---

## Cache

- [x] Redis ile ürün detay cache (TTL: 5dk) — sadece ACTIVE ürünler cache'lenir
- [x] Cache invalidation: product.updated, product.deleted event'lerinde
- [x] Admin onay sonrası cache bust

---

## Observability

- [x] OpenTelemetry tracing
- [x] Ürün görüntüleme metriği
- [x] Vendor başına ürün sayısı metriği
- [x] Onay bekleyen ürün sayısı metriği (admin dashboard için)
- [x] Structured JSON log
- [x] `/health` endpoint

---

## Tests

- [x] Unit: fiyat doğrulama, slug üretimi, OwnershipGuard
- [x] Unit: VENDOR başkasının ürününü düzenleyemez (403)
- [x] Unit: VENDOR status/vendorId alanını değiştiremez
- [x] Unit: CUSTOMER ürün ekleyemez (403)
- [x] Integration: vendor ürün ekle → PENDING_REVIEW → admin onaylar → ACTIVE
- [x] Admin redder → REJECTED + rejectionReason zorunlu
- [x] Integration: public endpoint yalnızca ACTIVE döndürür
- [x] E2E: ürün arama

---

## Docs

- [x] Swagger endpoint'leri (rol bazlı ayrım belirtilmiş)
- [x] Vendor ürün yaşam döngüsü diyagramı (`docs/` altına)
- [x] Rol-izin matrisi dokümantasyonu
