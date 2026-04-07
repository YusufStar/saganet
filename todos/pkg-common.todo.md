# packages/common todos

## Scaffold
- [x] packages/common klasörü oluştur
- [x] package.json (lib olarak export edilecek)
- [x] tsconfig.json, build script

## DTOs & Types
- [ ] Ortak request/response DTO'ları
- [ ] Pagination DTO (cursor & offset)
- [x] API response wrapper (data, error, meta)
- [ ] Ortak error kodları enum

## Decorators & Guards
- [ ] @CurrentUser() decorator
- [ ] @Roles() decorator
- [ ] IsPublic() metadata helper

## Validators
- [ ] Custom class-validator dekoratörler
- [ ] UUID validasyon
- [ ] Para birimi / tutar validasyonu

## Utilities
- [ ] Date helper (UTC normalize, format)
- [x] String helper (slug üretimi, truncate)
- [ ] Retry utility (exponential backoff)
- [ ] Deep clone / merge helper

## Constants
- [ ] HTTP durum kodları sabitleri
- [x] Kafka topic isimleri sabitleri
- [x] Servis adları sabitleri

## Tests
- [ ] Her utility için unit test

## Build & Export
- [x] Barrel export (index.ts)
- [x] npm workspace link kontrolü
