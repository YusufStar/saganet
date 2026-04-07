# Catalog Service — Product Lifecycle

## State Machine

```
VENDOR ürün ekler
       │
       ▼
 PENDING_REVIEW ──────────────────────────────────────────────┐
       │                                                       │
       │ ADMIN approve                                         │ ADMIN reject
       ▼                                                       ▼
    ACTIVE                                               REJECTED (+ rejectionReason)
       │                                                       │
       │ ADMIN suspend                                         │ VENDOR düzeltme yapar
       ▼                                                       │ → tekrar PENDING_REVIEW
  SUSPENDED                                                    │
       │                                                       │
       │ ADMIN approve (tekrar aktifleştirme)                  │
       └───────────────────────────────────────────────────────┘

VENDOR soft delete:
    Herhangi status → DELETED (deletedAt set edilir)

ADMIN hard delete:
    DB'den kalıcı olarak silinir (any status)
```

## Status Tanımları

| Status          | Açıklama                                                          |
|-----------------|-------------------------------------------------------------------|
| PENDING_REVIEW  | Vendor ekledi/düzeltti, admin onayı bekliyor                      |
| ACTIVE          | Admin onayladı, public listede görünür                            |
| REJECTED        | Admin reddetti, rejectionReason dolu, vendor görüntüleyebilir     |
| SUSPENDED       | Admin askıya aldı, public listede görünmez                        |
| DELETED         | Vendor soft delete yaptı, tamamen gizli                           |

## Kafka Events

| Event                | Tetikleyici              | Tüketiciler                        |
|----------------------|--------------------------|------------------------------------|
| product.created      | Vendor ürün ekler        | notification, inventory            |
| product.approved     | Admin onaylar            | inventory (stok kaydı açar)        |
| product.rejected     | Admin reddeder           | notification (vendora bildirim)    |
| product.suspended    | Admin askıya alır        | inventory (stok dondur)            |
| product.price-changed| Vendor fiyat değiştirir  | search-index, cart-service         |
| product.deleted      | Vendor siler             | inventory, search-index            |
