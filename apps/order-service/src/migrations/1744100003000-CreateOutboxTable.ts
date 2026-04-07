import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateOutboxTable1744100003000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS outbox (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        topic VARCHAR(255) NOT NULL,
        payload JSONB NOT NULL,
        "processedAt" TIMESTAMP,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_outbox_processed_at ON outbox("processedAt") WHERE "processedAt" IS NULL
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    // outbox is shared — do not drop
  }
}
