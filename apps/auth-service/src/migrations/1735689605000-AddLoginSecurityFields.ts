import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddLoginSecurityFields1735689605000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Account lockout fields on users
    await queryRunner.query(`
      ALTER TABLE "users"
        ADD COLUMN IF NOT EXISTS "failedLoginAttempts" integer NOT NULL DEFAULT 0,
        ADD COLUMN IF NOT EXISTS "lastFailedLoginAt" TIMESTAMP
    `);

    // Family ID for refresh token reuse detection on user_sessions
    await queryRunner.query(`
      ALTER TABLE "user_sessions"
        ADD COLUMN IF NOT EXISTS "familyId" uuid NOT NULL DEFAULT gen_random_uuid()
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_user_sessions_familyId" ON "user_sessions" ("familyId")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_user_sessions_familyId"`);
    await queryRunner.query(`ALTER TABLE "user_sessions" DROP COLUMN IF EXISTS "familyId"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "lastFailedLoginAt"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "failedLoginAttempts"`);
  }
}
