import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreateUserAddressesTable1744000101000 implements MigrationInterface {
  name = 'CreateUserAddressesTable1744000101000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'user_addresses',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          { name: 'userId', type: 'uuid', isNullable: false },
          { name: 'label', type: 'varchar', length: '50', isNullable: true },
          { name: 'fullName', type: 'varchar', length: '100', isNullable: false },
          { name: 'phone', type: 'varchar', length: '20', isNullable: true },
          { name: 'street', type: 'varchar', length: '255', isNullable: false },
          { name: 'district', type: 'varchar', length: '100', isNullable: true },
          { name: 'city', type: 'varchar', length: '100', isNullable: false },
          { name: 'postalCode', type: 'varchar', length: '20', isNullable: true },
          { name: 'country', type: 'varchar', length: '100', isNullable: false, default: "'Türkiye'" },
          { name: 'isDefault', type: 'boolean', default: false },
          { name: 'createdAt', type: 'timestamp', default: 'now()' },
          { name: 'updatedAt', type: 'timestamp', default: 'now()' },
          { name: 'deletedAt', type: 'timestamp', isNullable: true },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'user_addresses',
      new TableIndex({ name: 'IDX_user_addresses_userId', columnNames: ['userId'] }),
    );

    await queryRunner.createForeignKey(
      'user_addresses',
      new TableForeignKey({
        name: 'FK_user_addresses_userId',
        columnNames: ['userId'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('user_addresses', 'FK_user_addresses_userId');
    await queryRunner.dropIndex('user_addresses', 'IDX_user_addresses_userId');
    await queryRunner.dropTable('user_addresses');
  }
}
