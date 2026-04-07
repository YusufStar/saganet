# Web (apps/web)

Next.js 15 — App Router — port **3333**

## Roller

| Rol | Erişim |
|-----|--------|
| CUSTOMER | Katalog, sepet, ödeme, sipariş takibi |
| VENDOR | Ürün/stok yönetimi, kendi siparişleri |
| ADMIN | Tam sistem erişimi |

## API Bağlantısı

Tüm backend istekleri `http://localhost:3000` (api-gateway) üzerinden geçer.
`NEXT_PUBLIC_API_URL` env değişkeni ile konfigüre edilir.

## Geliştirme

```bash
pnpm --filter @saganet/web dev   # http://localhost:3333
```

## Auth Akışı

1. Login → access_token (body) + session_id cookie
2. Her istekte `Authorization: Bearer <access_token>`
3. Token expire → silent refresh via `/api/auth/refresh`
4. Rol bilgisi JWT payload'dan okunur → sayfa yönlendirmesi
