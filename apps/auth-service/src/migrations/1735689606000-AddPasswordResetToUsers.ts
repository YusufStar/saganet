import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPasswordResetToUsers1735689606000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users"
        ADD COLUMN IF NOT EXISTS "resetTokenHash" varchar,
        ADD COLUMN IF NOT EXISTS "resetTokenExpiresAt" TIMESTAMP;
      CREATE INDEX IF NOT EXISTS "IDX_users_resetTokenHash" ON "users" ("resetTokenHash");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX IF EXISTS "IDX_users_resetTokenHash";
      ALTER TABLE "users"
        DROP COLUMN IF EXISTS "resetTokenHash",
        DROP COLUMN IF EXISTS "resetTokenExpiresAt";
    `);
  }
}
