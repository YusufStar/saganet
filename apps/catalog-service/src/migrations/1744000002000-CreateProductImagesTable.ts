import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreateProductImagesTable1744000002000 implements MigrationInterface {
  name = 'CreateProductImagesTable1744000002000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."image_type_enum" AS ENUM ('THUMBNAIL', 'FULL')`,
    );

    await queryRunner.createTable(
      new Table({
        name: 'product_images',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          { name: 'productId', type: 'uuid', isNullable: false },
          { name: 'url', type: 'varchar', length: '2048', isNullable: false },
          { name: 'type', type: 'image_type_enum', default: "'FULL'" },
          { name: 'displayOrder', type: 'smallint', default: 0 },
          { name: 'createdAt', type: 'timestamp', default: 'now()' },
          { name: 'updatedAt', type: 'timestamp', default: 'now()' },
          { name: 'deletedAt', type: 'timestamp', isNullable: true },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'product_images',
      new TableIndex({ name: 'IDX_product_images_productId', columnNames: ['productId'] }),
    );

    await queryRunner.createForeignKey(
      'product_images',
      new TableForeignKey({
        name: 'FK_product_images_productId',
        columnNames: ['productId'],
        referencedTableName: 'products',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('product_images', 'FK_product_images_productId');
    await queryRunner.dropIndex('product_images', 'IDX_product_images_productId');
    await queryRunner.dropTable('product_images');
    await queryRunner.query(`DROP TYPE "public"."image_type_enum"`);
  }
}
