import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreateCategoriesTable1744000000000 implements MigrationInterface {
  name = 'CreateCategoriesTable1744000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'categories',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          { name: 'name', type: 'varchar', length: '255', isNullable: false },
          { name: 'slug', type: 'varchar', length: '255', isNullable: false },
          { name: 'parentId', type: 'uuid', isNullable: true },
          { name: 'createdAt', type: 'timestamp', default: 'now()' },
          { name: 'updatedAt', type: 'timestamp', default: 'now()' },
          { name: 'deletedAt', type: 'timestamp', isNullable: true },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'categories',
      new TableIndex({ name: 'IDX_categories_slug', columnNames: ['slug'], isUnique: true }),
    );

    await queryRunner.createIndex(
      'categories',
      new TableIndex({ name: 'IDX_categories_parentId', columnNames: ['parentId'] }),
    );

    await queryRunner.createForeignKey(
      'categories',
      new TableForeignKey({
        name: 'FK_categories_parentId',
        columnNames: ['parentId'],
        referencedTableName: 'categories',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('categories', 'FK_categories_parentId');
    await queryRunner.dropIndex('categories', 'IDX_categories_parentId');
    await queryRunner.dropIndex('categories', 'IDX_categories_slug');
    await queryRunner.dropTable('categories');
  }
}
