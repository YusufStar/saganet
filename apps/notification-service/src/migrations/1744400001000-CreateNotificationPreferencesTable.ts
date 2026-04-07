import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateNotificationPreferencesTable1744400001000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE notification_preferences (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "userId" VARCHAR NOT NULL,
        channel VARCHAR NOT NULL,
        "eventType" VARCHAR NOT NULL,
        enabled BOOLEAN NOT NULL DEFAULT true,
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX idx_notification_preferences_unique
      ON notification_preferences("userId", channel, "eventType")
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS notification_preferences`);
  }
}
