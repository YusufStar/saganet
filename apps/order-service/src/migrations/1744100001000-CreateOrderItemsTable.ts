import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateOrderItemsTable1744100001000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE order_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "orderId" UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        "productId" UUID NOT NULL,
        "productName" VARCHAR(500) NOT NULL,
        quantity INTEGER NOT NULL,
        "unitPrice" NUMERIC(12,2) NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP
      )
    `);
    await queryRunner.query(`CREATE INDEX idx_order_items_order_id ON order_items("orderId")`);
    await queryRunner.query(`CREATE INDEX idx_order_items_product_id ON order_items("productId")`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS order_items`);
  }
}
