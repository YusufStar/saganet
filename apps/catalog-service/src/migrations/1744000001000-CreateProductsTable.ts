import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreateProductsTable1744000001000 implements MigrationInterface {
  name = 'CreateProductsTable1744000001000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."product_status_enum" AS ENUM ('PENDING_REVIEW', 'ACTIVE', 'REJECTED', 'SUSPENDED', 'DELETED')`,
    );

    await queryRunner.createTable(
      new Table({
        name: 'products',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          { name: 'vendorId', type: 'uuid', isNullable: false },
          { name: 'name', type: 'varchar', length: '255', isNullable: false },
          { name: 'description', type: 'text', isNullable: true },
          { name: 'slug', type: 'varchar', length: '255', isNullable: false },
          { name: 'price', type: 'numeric', precision: 12, scale: 2, isNullable: false },
          { name: 'categoryId', type: 'uuid', isNullable: false },
          {
            name: 'status',
            type: 'product_status_enum',
            default: "'PENDING_REVIEW'",
          },
          { name: 'rejectionReason', type: 'text', isNullable: true },
          { name: 'createdAt', type: 'timestamp', default: 'now()' },
          { name: 'updatedAt', type: 'timestamp', default: 'now()' },
          { name: 'deletedAt', type: 'timestamp', isNullable: true },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'products',
      new TableIndex({ name: 'IDX_products_slug', columnNames: ['slug'], isUnique: true }),
    );

    await queryRunner.createIndex(
      'products',
      new TableIndex({ name: 'IDX_products_vendorId', columnNames: ['vendorId'] }),
    );

    await queryRunner.createIndex(
      'products',
      new TableIndex({ name: 'IDX_products_categoryId', columnNames: ['categoryId'] }),
    );

    await queryRunner.createIndex(
      'products',
      new TableIndex({ name: 'IDX_products_status', columnNames: ['status'] }),
    );

    // Composite: vendor kendi ürünlerini status'a göre sorgularken kullanılır
    await queryRunner.createIndex(
      'products',
      new TableIndex({
        name: 'IDX_products_vendorId_status',
        columnNames: ['vendorId', 'status'],
      }),
    );

    await queryRunner.createIndex(
      'products',
      new TableIndex({ name: 'IDX_products_price', columnNames: ['price'] }),
    );

    await queryRunner.createForeignKey(
      'products',
      new TableForeignKey({
        name: 'FK_products_categoryId',
        columnNames: ['categoryId'],
        referencedTableName: 'categories',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('products', 'FK_products_categoryId');
    await queryRunner.dropIndex('products', 'IDX_products_vendorId_status');
    await queryRunner.dropIndex('products', 'IDX_products_price');
    await queryRunner.dropIndex('products', 'IDX_products_status');
    await queryRunner.dropIndex('products', 'IDX_products_categoryId');
    await queryRunner.dropIndex('products', 'IDX_products_vendorId');
    await queryRunner.dropIndex('products', 'IDX_products_slug');
    await queryRunner.dropTable('products');
    await queryRunner.query(`DROP TYPE "public"."product_status_enum"`);
  }
}
