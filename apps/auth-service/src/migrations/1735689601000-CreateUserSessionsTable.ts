import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreateUserSessionsTable1735689601000 implements MigrationInterface {
  name = 'CreateUserSessionsTable1735689601000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'user_sessions',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          { name: 'userId', type: 'uuid', isNullable: false },
          { name: 'refreshTokenHash', type: 'varchar', isNullable: false },
          { name: 'userAgent', type: 'varchar', length: '512', isNullable: true },
          { name: 'ipAddress', type: 'varchar', length: '64', isNullable: true },
          { name: 'lastActiveAt', type: 'timestamp', isNullable: false },
          { name: 'expiresAt', type: 'timestamp', isNullable: false },
          { name: 'revokedAt', type: 'timestamp', isNullable: true },
          { name: 'createdAt', type: 'timestamp', default: 'now()' },
          { name: 'updatedAt', type: 'timestamp', default: 'now()' },
          { name: 'deletedAt', type: 'timestamp', isNullable: true },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'user_sessions',
      new TableIndex({ name: 'IDX_user_sessions_userId', columnNames: ['userId'] }),
    );

    await queryRunner.createIndex(
      'user_sessions',
      new TableIndex({ name: 'IDX_user_sessions_expiresAt', columnNames: ['expiresAt'] }),
    );

    await queryRunner.createForeignKey(
      'user_sessions',
      new TableForeignKey({
        name: 'FK_user_sessions_userId',
        columnNames: ['userId'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('user_sessions', 'FK_user_sessions_userId');
    await queryRunner.dropIndex('user_sessions', 'IDX_user_sessions_expiresAt');
    await queryRunner.dropIndex('user_sessions', 'IDX_user_sessions_userId');
    await queryRunner.dropTable('user_sessions');
  }
}
