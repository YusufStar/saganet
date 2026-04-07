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

- [ ] `POST /vendor/products` — ürün ekle (status=PENDING_REVIEW otomatik set edilir, vendor değiştiremez)
- [ ] `GET /vendor/products` — kendi ürünlerini listele (tüm status'lar)
- [ ] `PATCH /vendor/products/:id` — kendi ürününü düzenle
  - **Güvenlik:** `vendorId === req.user.id` kontrolü (OwnershipGuard)
  - **Güvenlik:** `status`, `vendorId`, `rejectionReason` alanlarını VENDOR değiştiremez
  - Düzenleme sonrası status tekrar PENDING_REVIEW'a döner
- [ ] `DELETE /vendor/products/:id` — soft delete (sadece kendi ürünü, status=DELETED)

### Admin Endpoint'leri (`@Roles(ADMIN)`)

- [ ] `GET /admin/products` — tüm ürünler (tüm status'lar, tüm vendor'lar)
- [ ] `POST /admin/products` — admin doğrudan ACTIVE ürün ekleyebilir
- [ ] `PATCH /admin/products/:id` — herhangi bir ürünü düzenle
- [ ] `DELETE /admin/products/:id` — hard delete
- [ ] `PATCH /admin/products/:id/approve` — status → ACTIVE
- [ ] `PATCH /admin/products/:id/reject` — status → REJECTED + rejectionReason zorunlu
- [ ] `PATCH /admin/products/:id/suspend` — status → SUSPENDED
- [ ] `POST /admin/categories` — kategori ekle
- [ ] `PATCH /admin/categories/:id` — kategori düzenle
- [ ] `DELETE /admin/categories/:id` — kategori sil

---

## Güvenlik

- [ ] **OwnershipGuard**: `vendorId === req.user.id` — her VENDOR işleminde kontrol et, 403 dön
- [ ] **DTO kısıtlamaları:**
  - `price` → `@IsPositive()`, `@Min(0.01)`, max sınır (örn. 1_000_000)
  - `vendorId` → VENDOR DTO'sunda hiç bulunmasın (backend set eder, `req.user.id`)
  - `status` → VENDOR DTO'sunda hiç bulunmasın
  - `rejectionReason` → sadece Admin DTO'sunda
- [ ] **Header doğrulama:** `x-user-id`, `x-user-role` headerları API Gateway'den gelir — doğrudan dışarıdan kabul etme
- [ ] **Input sanitization:** `description` alanı HTML strip (XSS)
- [ ] **Görsel upload güvenliği:** (ayrı bölümde detay)
- [ ] **Rate limiting:** vendor ürün ekleme endpoint'ine limit (örn. 100 ürün/saat)

---

## Arama & Filtreleme

- [ ] Fiyat aralığı filtresi (`minPrice`, `maxPrice`)
- [ ] Kategori filtresi
- [ ] Vendor filtresi (admin için)
- [ ] Status filtresi (admin: tümü, vendor: kendi, public: yalnızca ACTIVE)
- [ ] Fulltext arama (PostgreSQL `tsvector`)
- [ ] Sıralama: fiyat, tarih, ad
- [ ] Cursor-based pagination

---

## Görsel / Medya

- [ ] Ürün görseli upload endpoint'i (`POST /vendor/products/:id/images`)
  - **Güvenlik:** `vendorId` ownership kontrolü
  - **Güvenlik:** Sadece `image/jpeg`, `image/png`, `image/webp` kabul et (MIME type doğrula)
  - **Güvenlik:** Max dosya boyutu: 5MB
  - **Güvenlik:** Dosya adı sanitize (path traversal önleme)
  - **Güvenlik:** Magic bytes kontrolü (Content-Type header'ına güvenme)
- [ ] Görsel boyutlandırma (thumbnail, full)
- [ ] CDN entegrasyon hazırlığı

---

## Database

- [x] Migration: `products` tablosu (`vendorId`, `status`, `rejectionReason` dahil)
- [x] Migration: `categories` tablosu
- [x] Migration: `product_images` tablosu
- [x] Index: `price`, `category_id`, `vendor_id`, `status`, `created_at`
- [x] Composite index: `(vendor_id, status)` — vendor kendi ürünlerini sorgularken

---

## Kafka Events

- [ ] `product.created` event yayınla (vendorId dahil)
- [ ] `product.approved` event yayınla (inventory-service stok kaydı açabilir)
- [ ] `product.price-changed` event yayınla
- [ ] `product.suspended` event yayınla
- [ ] `product.deleted` event yayınla
- [ ] `stock.updated` event'ini inventory-service'ten dinle

---

## Cache

- [ ] Redis ile ürün detay cache (TTL: 5dk) — sadece ACTIVE ürünler cache'lenir
- [ ] Cache invalidation: `product.updated`, `product.suspended`, `product.deleted` event'lerinde
- [ ] Admin onay sonrası cache bust

---

## Observability

- [ ] OpenTelemetry tracing
- [ ] Ürün görüntüleme metriği
- [ ] Vendor başına ürün sayısı metriği
- [ ] Onay bekleyen ürün sayısı metriği (admin dashboard için)
- [ ] Structured JSON log
- [ ] `/health` endpoint

---

## Tests

- [ ] Unit: fiyat doğrulama, slug üretimi, OwnershipGuard
- [ ] Unit: VENDOR başkasının ürününü düzenleyemez (403)
- [ ] Unit: VENDOR status/vendorId alanını değiştiremez
- [ ] Unit: CUSTOMER ürün ekleyemez (403)
- [ ] Integration: vendor ürün ekle → PENDING_REVIEW → admin onaylar → ACTIVE
- [ ] Integration: admin redder → REJECTED + rejectionReason zorunlu
- [ ] Integration: public endpoint yalnızca ACTIVE döndürür
- [ ] E2E: ürün arama

---

## Docs

- [ ] Swagger endpoint'leri (rol bazlı ayrım belirtilmiş)
- [ ] Vendor ürün yaşam döngüsü diyagramı (`docs/` altına)
- [ ] Rol-izin matrisi dokümantasyonu
