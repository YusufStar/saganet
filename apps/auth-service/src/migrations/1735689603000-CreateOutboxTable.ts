import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateOutboxTable1735689603000 implements MigrationInterface {
  name = 'CreateOutboxTable1735689603000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'outbox',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          { name: 'topic', type: 'varchar', isNullable: false },
          { name: 'payload', type: 'jsonb', isNullable: false },
          { name: 'sentAt', type: 'timestamp', isNullable: true },
          { name: 'retryCount', type: 'integer', default: 0 },
          { name: 'createdAt', type: 'timestamp', default: 'now()' },
          { name: 'updatedAt', type: 'timestamp', default: 'now()' },
          { name: 'deletedAt', type: 'timestamp', isNullable: true },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'outbox',
      new TableIndex({
        name: 'IDX_outbox_sentAt_retryCount',
        columnNames: ['sentAt', 'retryCount'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('outbox', 'IDX_outbox_sentAt_retryCount');
    await queryRunner.dropTable('outbox');
  }
}
