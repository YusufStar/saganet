# Order Service — Saga Akış Diyagramı

## Mutlu Yol (Happy Path)

```
POST /orders
     │
     ▼
  PENDING ──outbox──► inventory.reserve
     │
     │ [inventory.reserved]
     ▼
 CONFIRMED ──outbox──► payment.charge
     │
     │ [payment.completed]
     ▼
 COMPLETED ──outbox──► order.completed
```

## Compensation (Ödeme Başarısız)

```
 CONFIRMED
     │ [payment.failed]
     ▼
  FAILED ──outbox──► inventory.release + order.failed
```

## Stok Yetersiz

```
  PENDING
     │ [inventory.reservation-failed]
     ▼
  FAILED ──outbox──► order.failed
```

## Timeout (5 dakika içinde cevap gelmezse)

```
  PENDING / CONFIRMED
     │ [SagaTimeoutService]
     ▼
  FAILED ──outbox──► order.failed
```

## Kafka Topics

| Topic                        | Yön    | Açıklama                              |
|------------------------------|--------|---------------------------------------|
| order.created                | Yayınla| Sipariş oluşturuldu                  |
| inventory.reserve            | Yayınla| Stok rezervasyon komutu              |
| inventory.reserved           | Dinle  | Stok başarıyla rezerve edildi        |
| inventory.reservation-failed | Dinle  | Stok yetersiz                        |
| payment.charge               | Yayınla| Ödeme alma komutu                    |
| payment.completed            | Dinle  | Ödeme başarılı                       |
| payment.failed               | Dinle  | Ödeme başarısız                      |
| inventory.release            | Yayınla| Compensation: stok serbest bırak     |
| order.completed              | Yayınla| Sipariş tamamlandı                   |
| order.failed                 | Yayınla| Sipariş başarısız                    |
| order.cancelled              | Yayınla| Sipariş iptal edildi                 |
