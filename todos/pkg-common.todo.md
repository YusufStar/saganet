# packages/common todos

## Scaffold
- [x] packages/common klasörü oluştur
- [x] package.json (lib olarak export edilecek)
- [x] tsconfig.json, build script

## DTOs & Types
- [x] Ortak request/response DTO'ları
- [x] Pagination DTO (cursor & offset)
- [x] API response wrapper (data, error, meta)
- [x] Ortak error kodları enum

## Decorators & Guards
- [x] @CurrentUser() decorator
- [x] @Roles() decorator
- [x] IsPublic() metadata helper

## Validators
- [x] Custom class-validator dekoratörler
- [x] UUID validasyon
- [x] Para birimi / tutar validasyonu

## Utilities
- [x] Date helper (UTC normalize, format)
- [x] String helper (slug üretimi, truncate)
- [x] Retry utility (exponential backoff)
- [x] Deep clone / merge helper

## Constants
- [x] HTTP durum kodları sabitleri
- [x] Kafka topic isimleri sabitleri
- [x] Servis adları sabitleri

## Tests
- [x] Her utility için unit test

## Build & Export
- [x] Barrel export (index.ts)
- [x] npm workspace link kontrolü
