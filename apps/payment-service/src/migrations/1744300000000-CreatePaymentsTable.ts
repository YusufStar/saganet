import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePaymentsTable1744300000000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE payment_status_enum AS ENUM ('PENDING','COMPLETED','FAILED','REFUNDED')
    `);
    await queryRunner.query(`
      CREATE TABLE payments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "orderId" UUID NOT NULL UNIQUE,
        "userId" UUID NOT NULL,
        amount NUMERIC(12,2) NOT NULL,
        currency VARCHAR(3) NOT NULL DEFAULT 'TRY',
        status payment_status_enum NOT NULL DEFAULT 'PENDING',
        provider VARCHAR(50) NOT NULL DEFAULT 'mock',
        "cardLast4" VARCHAR(4),
        "failureReason" TEXT,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(`CREATE INDEX idx_payments_order_id ON payments("orderId")`);
    await queryRunner.query(`CREATE INDEX idx_payments_user_id ON payments("userId")`);
    await queryRunner.query(`CREATE INDEX idx_payments_status ON payments(status)`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS payments`);
    await queryRunner.query(`DROP TYPE IF EXISTS payment_status_enum`);
  }
}
