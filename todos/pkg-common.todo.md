# packages/common todos

## Scaffold
- [ ] packages/common klasörü oluştur
- [ ] package.json (lib olarak export edilecek)
- [ ] tsconfig.json, build script

## DTOs & Types
- [ ] Ortak request/response DTO'ları
- [ ] Pagination DTO (cursor & offset)
- [ ] API response wrapper (data, error, meta)
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
- [ ] String helper (slug üretimi, truncate)
- [ ] Retry utility (exponential backoff)
- [ ] Deep clone / merge helper

## Constants
- [ ] HTTP durum kodları sabitleri
- [ ] Kafka topic isimleri sabitleri
- [ ] Servis adları sabitleri

## Tests
- [ ] Her utility için unit test

## Build & Export
- [ ] Barrel export (index.ts)
- [ ] npm workspace link kontrolü
