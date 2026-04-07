import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateOrdersTable1744100000000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE order_status_enum AS ENUM ('PENDING','CONFIRMED','FAILED','CANCELLED','COMPLETED')
    `);
    await queryRunner.query(`
      CREATE TABLE orders (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "userId" UUID NOT NULL,
        status order_status_enum NOT NULL DEFAULT 'PENDING',
        "addressSnapshot" JSONB NOT NULL,
        "totalAmount" NUMERIC(12,2) NOT NULL,
        "idempotencyKey" VARCHAR(128),
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP
      )
    `);
    await queryRunner.query(`CREATE INDEX idx_orders_user_id ON orders("userId")`);
    await queryRunner.query(`CREATE INDEX idx_orders_status ON orders(status)`);
    await queryRunner.query(`CREATE UNIQUE INDEX idx_orders_idempotency_key ON orders("idempotencyKey") WHERE "idempotencyKey" IS NOT NULL`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS orders`);
    await queryRunner.query(`DROP TYPE IF EXISTS order_status_enum`);
  }
}
