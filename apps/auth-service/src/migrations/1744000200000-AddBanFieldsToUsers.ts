import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBanFieldsToUsers1744000200000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users"
        ADD COLUMN IF NOT EXISTS "isBanned" boolean NOT NULL DEFAULT false,
        ADD COLUMN IF NOT EXISTS "bannedAt" TIMESTAMP
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "bannedAt"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "isBanned"`);
  }
}
