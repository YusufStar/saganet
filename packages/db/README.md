# @saganet/db

Shared database utilities for saganet microservices.

## Usage

### DatabaseModule

```typescript
import { DatabaseModule } from '@saganet/db';

DatabaseModule.forRoot({
  entities: [UserEntity, SessionEntity],
})
```

### Pagination

```typescript
import { buildOffsetPagination, encodeCursor, decodeCursor } from '@saganet/db';

// Offset pagination
const { skip, take, page, limit } = buildOffsetPagination({ page: 1, limit: 20 });

// Cursor pagination
const cursor = encodeCursor({ id: 'abc', createdAt: '2024-01-01' });
const decoded = decodeCursor(cursor);
```

### Transaction helper

```typescript
import { withTransaction } from '@saganet/db';

await withTransaction(dataSource, async (manager) => {
  await manager.save(OrderEntity, order);
  await manager.save(OutboxEntity, outboxEntry);
});
```

### BaseSeeder

```typescript
import { BaseSeeder } from '@saganet/db';

export class ProductSeeder extends BaseSeeder {
  async run() {
    if (await this.tableIsEmpty('products')) {
      await this.dataSource.query(`INSERT INTO products ...`);
    }
  }
}
```

## Migration Strategy

Each microservice manages its own migrations in `apps/{service}/src/migrations/`. Run migrations per service:

```bash
pnpm --filter @saganet/auth-service migration:run
pnpm --filter @saganet/catalog-service migration:run
# etc.
```
