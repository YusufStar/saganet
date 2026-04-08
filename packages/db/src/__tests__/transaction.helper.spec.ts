import { withTransaction } from '../transaction.helper';
import type { DataSource, EntityManager } from 'typeorm';

describe('withTransaction()', () => {
  it('calls the callback with an EntityManager and returns its result', async () => {
    const mockManager = {} as EntityManager;
    const mockDataSource = {
      transaction: jest.fn().mockImplementation(async (fn: (m: EntityManager) => Promise<unknown>) => fn(mockManager)),
    } as unknown as DataSource;

    const result = await withTransaction(mockDataSource, async (manager) => {
      expect(manager).toBe(mockManager);
      return 'transaction-result';
    });

    expect(result).toBe('transaction-result');
    expect(mockDataSource.transaction).toHaveBeenCalledTimes(1);
  });

  it('propagates errors from the transaction callback', async () => {
    const mockDataSource = {
      transaction: jest.fn().mockImplementation(async (fn: (m: EntityManager) => Promise<unknown>) => fn({} as EntityManager)),
    } as unknown as DataSource;

    await expect(
      withTransaction(mockDataSource, async () => {
        throw new Error('tx failed');
      }),
    ).rejects.toThrow('tx failed');
  });
});
