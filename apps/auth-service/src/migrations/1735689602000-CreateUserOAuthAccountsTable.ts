import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreateUserOAuthAccountsTable1735689602000 implements MigrationInterface {
  name = 'CreateUserOAuthAccountsTable1735689602000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."oauth_provider_enum" AS ENUM ('GOOGLE', 'GITHUB')`,
    );

    await queryRunner.createTable(
      new Table({
        name: 'user_oauth_accounts',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          { name: 'userId', type: 'uuid', isNullable: false },
          { name: 'provider', type: 'oauth_provider_enum', isNullable: false },
          { name: 'providerAccountId', type: 'varchar', length: '255', isNullable: false },
          { name: 'accessToken', type: 'text', isNullable: true },
          { name: 'refreshToken', type: 'text', isNullable: true },
          { name: 'accessTokenExpiresAt', type: 'timestamp', isNullable: true },
          { name: 'scope', type: 'varchar', length: '512', isNullable: true },
          { name: 'createdAt', type: 'timestamp', default: 'now()' },
          { name: 'updatedAt', type: 'timestamp', default: 'now()' },
          { name: 'deletedAt', type: 'timestamp', isNullable: true },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'user_oauth_accounts',
      new TableIndex({ name: 'IDX_user_oauth_accounts_userId', columnNames: ['userId'] }),
    );

    await queryRunner.createIndex(
      'user_oauth_accounts',
      new TableIndex({
        name: 'IDX_user_oauth_accounts_provider_providerAccountId',
        columnNames: ['provider', 'providerAccountId'],
        isUnique: true,
      }),
    );

    await queryRunner.createForeignKey(
      'user_oauth_accounts',
      new TableForeignKey({
        name: 'FK_user_oauth_accounts_userId',
        columnNames: ['userId'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('user_oauth_accounts', 'FK_user_oauth_accounts_userId');
    await queryRunner.dropIndex(
      'user_oauth_accounts',
      'IDX_user_oauth_accounts_provider_providerAccountId',
    );
    await queryRunner.dropIndex('user_oauth_accounts', 'IDX_user_oauth_accounts_userId');
    await queryRunner.dropTable('user_oauth_accounts');
    await queryRunner.query(`DROP TYPE "public"."oauth_provider_enum"`);
  }
}
