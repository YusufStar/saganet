import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateStockLedgerTable1744200001000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE ledger_type_enum AS ENUM ('RESTOCK','RESERVE','RELEASE','ADJUST')
    `);
    await queryRunner.query(`
      CREATE TABLE stock_ledger (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "productId" UUID NOT NULL,
        type ledger_type_enum NOT NULL,
        delta INTEGER NOT NULL,
        "referenceId" UUID,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(`CREATE INDEX idx_stock_ledger_product_id ON stock_ledger("productId")`);
    await queryRunner.query(`CREATE INDEX idx_stock_ledger_reference_id ON stock_ledger("referenceId")`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS stock_ledger`);
    await queryRunner.query(`DROP TYPE IF EXISTS ledger_type_enum`);
  }
}
