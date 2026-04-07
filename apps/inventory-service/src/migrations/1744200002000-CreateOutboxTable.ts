import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateOutboxTable1744200002000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS outbox (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        topic VARCHAR(255) NOT NULL,
        payload JSONB NOT NULL,
        "sentAt" TIMESTAMP,
        "retryCount" INTEGER NOT NULL DEFAULT 0,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_outbox_sent_at ON outbox("sentAt") WHERE "sentAt" IS NULL
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    // shared table — do not drop
  }
}
