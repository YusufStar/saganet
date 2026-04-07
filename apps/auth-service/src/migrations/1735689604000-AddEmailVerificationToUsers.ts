import { MigrationInterface, QueryRunner, TableColumn, TableIndex } from 'typeorm';

export class AddEmailVerificationToUsers1735689604000 implements MigrationInterface {
  name = 'AddEmailVerificationToUsers1735689604000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns('users', [
      new TableColumn({ name: 'emailVerified', type: 'boolean', default: false }),
      new TableColumn({ name: 'verificationTokenHash', type: 'varchar', isNullable: true }),
      new TableColumn({ name: 'verificationTokenExpiresAt', type: 'timestamp', isNullable: true }),
    ]);

    await queryRunner.createIndex(
      'users',
      new TableIndex({
        name: 'IDX_users_verificationTokenHash',
        columnNames: ['verificationTokenHash'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('users', 'IDX_users_verificationTokenHash');
    await queryRunner.dropColumn('users', 'verificationTokenExpiresAt');
    await queryRunner.dropColumn('users', 'verificationTokenHash');
    await queryRunner.dropColumn('users', 'emailVerified');
  }
}
