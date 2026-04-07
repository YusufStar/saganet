import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFulltextSearchToProducts1744000003000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE products ADD COLUMN IF NOT EXISTS search_vector tsvector
      GENERATED ALWAYS AS (
        setweight(to_tsvector('simple', coalesce(name, '')), 'A') ||
        setweight(to_tsvector('simple', coalesce(description, '')), 'B')
      ) STORED
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_products_search_vector
      ON products USING GIN(search_vector)
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_products_search_vector`);
    await queryRunner.query(`ALTER TABLE products DROP COLUMN IF EXISTS search_vector`);
  }
}
