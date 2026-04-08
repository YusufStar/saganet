import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateReviewsTables1744000004000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "user_purchased_products" (
        "id"         UUID NOT NULL DEFAULT gen_random_uuid(),
        "userId"     UUID NOT NULL,
        "productId"  UUID NOT NULL,
        "orderId"    UUID NOT NULL,
        "createdAt"  TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt"  TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_user_purchased_products" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_user_purchased_products_user_product" UNIQUE ("userId", "productId")
      )
    `);

    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_upp_userId"    ON "user_purchased_products" ("userId")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_upp_productId" ON "user_purchased_products" ("productId")`);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "reviews" (
        "id"         UUID NOT NULL DEFAULT gen_random_uuid(),
        "productId"  UUID NOT NULL,
        "userId"     UUID NOT NULL,
        "orderId"    UUID NOT NULL,
        "rating"     SMALLINT NOT NULL,
        "comment"    TEXT,
        "createdAt"  TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt"  TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_reviews" PRIMARY KEY ("id"),
        CONSTRAINT "CHK_reviews_rating" CHECK ("rating" >= 1 AND "rating" <= 5),
        CONSTRAINT "FK_reviews_product"
          FOREIGN KEY ("productId") REFERENCES "products" ("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_reviews_productId" ON "reviews" ("productId")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_reviews_userId"    ON "reviews" ("userId")`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "reviews"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "user_purchased_products"`);
  }
}
