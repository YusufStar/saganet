import { DataSource, EntityManager } from 'typeorm';

/**
 * Execute a function within a TypeORM transaction.
 * Automatically commits on success, rolls back on error.
 */
export async function withTransaction<T>(
  dataSource: DataSource,
  fn: (manager: EntityManager) => Promise<T>,
): Promise<T> {
  return dataSource.transaction(fn);
}
