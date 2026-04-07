# Inventory Service — Stock Flow

## Admin Operations

```
Admin POST /inventory        → create/update stock entry (upsert)
Admin PATCH /inventory/:productId/adjust → delta adjustment (+/-)
```

## Saga Flow

```
order-service
    └─► inventory.reserve (Kafka)
            │
            ▼
    InventoryConsumerService
            │
            ├─ available >= requested?
            │   YES → SELECT FOR UPDATE → deduct available → outbox: inventory.reserved
            │   NO  → outbox: inventory.reservation-failed
            │
            ▼
    OutboxRelayService → Kafka
            │
            ▼
    order-service (saga advances or fails)
```

## Compensation Flow

```
order-service
    └─► inventory.release (Kafka)
            │
            ▼
    InventoryConsumerService → restore available → outbox: inventory.released
            │
            ▼
    OutboxRelayService → Kafka
            │
            ▼
    order-service (saga compensation complete)
```

## Idempotency

All reserve/release operations check `StockLedgerEntity` for an existing record with the same `referenceId` (orderId) and `type` before processing. Duplicate commands are silently ignored.

## Concurrency

`SELECT FOR UPDATE` is used on the `inventory` row during reserve/release/adjust operations to prevent race conditions when multiple saga instances process orders concurrently.

## Kafka Topics

| Topic                          | Direction  | Description                          |
|-------------------------------|------------|--------------------------------------|
| `inventory.reserve`           | Consumed   | Order-service saga reserve command   |
| `inventory.release`           | Consumed   | Order-service saga release command   |
| `inventory.reserved`          | Produced   | Reservation succeeded                |
| `inventory.reservation-failed`| Produced   | Insufficient stock                   |
| `inventory.released`          | Produced   | Stock released (compensation)        |
| `inventory.stock-updated`     | Produced   | Admin upsert/adjust (for catalog)    |
