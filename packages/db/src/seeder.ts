import { DataSource } from 'typeorm';

export abstract class BaseSeeder {
  constructor(protected readonly dataSource: DataSource) {}

  abstract run(): Promise<void>;

  protected async tableIsEmpty(tableName: string): Promise<boolean> {
    const result = await this.dataSource.query(
      `SELECT COUNT(*) as count FROM "${tableName}"`,
    );
    return parseInt(result[0].count, 10) === 0;
  }
}
