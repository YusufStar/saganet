# web (Next.js) todos

## Scaffold

- [x] Next.js 15 projesi oluştur (apps/web)
- [x] Port 3333'te çalışacak şekilde ayarla
- [x] pnpm workspace'e ekle
- [ ] API client katmanı (api-gateway → tüm servisler)
- [ ] Auth context (JWT token yönetimi, cookie/localStorage)
- [ ] Ortak layout (header, sidebar, footer)

## Auth Akışı

- [ ] Login sayfası (POST /api/auth/login)
- [ ] Register sayfası (POST /api/auth/register)
- [ ] E-posta doğrulama yönlendirmesi
- [ ] Token refresh (silent refresh)
- [ ] Logout
- [ ] Protected route HOC / middleware

## CUSTOMER (Son Kullanıcı)

- [ ] Ana sayfa — öne çıkan ürünler
- [ ] Katalog sayfası (ürün listesi, filtre, arama)
- [ ] Ürün detay sayfası
- [ ] Sepet (client-side state)
- [ ] Ödeme akışı
  - [ ] Adres seçimi (GET /api/auth/addresses)
  - [ ] Ödeme bilgisi girişi (kart)
  - [ ] Sipariş onayı
- [ ] Sipariş geçmişi (GET /api/orders)
- [ ] Sipariş detayı
- [ ] Profil sayfası (GET/PATCH /api/auth/profile)
- [ ] Adres yönetimi (CRUD /api/auth/addresses)

## VENDOR (Satıcı)

- [ ] Vendor dashboard (satış özeti, aktif ürünler)
- [ ] Ürün yönetimi
  - [ ] Ürün listesi (GET /api/catalog/products?vendorId=...)
  - [ ] Ürün oluştur (POST /api/catalog/products)
  - [ ] Ürün güncelle (PATCH /api/catalog/products/:id)
  - [ ] Ürün sil (DELETE /api/catalog/products/:id)
  - [ ] Görsel yükleme
- [ ] Stok yönetimi (GET/PATCH /api/inventory)
- [ ] Sipariş yönetimi (kendi ürünlerine gelen siparişler)

## ADMIN

- [ ] Admin dashboard (sistem geneli istatistikler)
- [ ] Kullanıcı yönetimi (GET /api/auth/admin/users)
- [ ] Kategori yönetimi (POST/PATCH/DELETE /api/catalog/categories)
- [ ] Tüm ürünler (onay/deaktif etme)
- [ ] Tüm siparişler
- [ ] Ödeme geçmişi (GET /api/payments)
- [ ] Simülasyon: ödeme webhook tetikle (POST /api/payments/webhook/simulate)

## API Entegrasyonu

- [ ] `src/lib/api.ts` — temel fetch wrapper (Bearer token ekleme)
- [ ] `src/lib/auth.ts` — token al/kaydet/yenile
- [ ] `src/services/catalog.service.ts` — katalog API çağrıları
- [ ] `src/services/order.service.ts` — sipariş API çağrıları
- [ ] `src/services/payment.service.ts` — ödeme API çağrıları
- [ ] `src/services/inventory.service.ts` — stok API çağrıları
- [ ] Next.js middleware — token doğrulama + rol bazlı yönlendirme

## State Management

- [ ] Auth state (context veya zustand)
- [ ] Sepet state (zustand + localStorage persist)
- [ ] Bildirim/toast sistemi

## UI/UX

- [ ] Tasarım sistemi / component library seç (shadcn/ui önerilen)
- [ ] Ortak bileşenler: Button, Input, Card, Modal, Table, Badge
- [ ] Responsive layout (mobile-first)
- [ ] Loading states / skeleton screens
- [ ] Error boundary

## Observability

- [ ] Client-side error logging (Sentry veya özel)
- [ ] Web vitals ölçümü

## Tests

- [ ] Unit: API client fonksiyonları
- [ ] Component: render testleri (Vitest + React Testing Library)
- [ ] E2E: kritik akışlar (Playwright)

## Docs

- [ ] Yerel geliştirme kurulum rehberi
- [ ] Yeni sayfa / route ekleme rehberi
- [ ] API client kullanım örnekleri
