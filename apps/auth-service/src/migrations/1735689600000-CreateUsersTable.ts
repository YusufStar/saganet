import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateUsersTable1735689600000 implements MigrationInterface {
  name = 'CreateUsersTable1735689600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."user_role_enum" AS ENUM ('ADMIN', 'CUSTOMER', 'VENDOR')`,
    );

    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          { name: 'email', type: 'varchar', length: '255', isNullable: false },
          { name: 'passwordHash', type: 'varchar', isNullable: true },
          {
            name: 'role',
            type: 'user_role_enum',
            default: "'CUSTOMER'",
          },
          { name: 'createdAt', type: 'timestamp', default: 'now()' },
          { name: 'updatedAt', type: 'timestamp', default: 'now()' },
          { name: 'deletedAt', type: 'timestamp', isNullable: true },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'users',
      new TableIndex({ name: 'IDX_users_email', columnNames: ['email'], isUnique: true }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('users', 'IDX_users_email');
    await queryRunner.dropTable('users');
    await queryRunner.query(`DROP TYPE "public"."user_role_enum"`);
  }
}
