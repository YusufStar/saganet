import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddProfileFieldsToUsers1744000100000 implements MigrationInterface {
  name = 'AddProfileFieldsToUsers1744000100000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns('users', [
      new TableColumn({ name: 'displayName', type: 'varchar', length: '100', isNullable: true }),
      new TableColumn({ name: 'avatarUrl', type: 'varchar', length: '2048', isNullable: true }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('users', 'avatarUrl');
    await queryRunner.dropColumn('users', 'displayName');
  }
}
