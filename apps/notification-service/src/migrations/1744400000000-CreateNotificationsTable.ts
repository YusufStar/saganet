import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateNotificationsTable1744400000000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE notification_status_enum AS ENUM ('PENDING','SENT','FAILED');
      EXCEPTION WHEN duplicate_object THEN null;
      END $$
    `);
    await queryRunner.query(`
      CREATE TABLE notifications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "userId" VARCHAR NOT NULL,
        email VARCHAR NOT NULL,
        type VARCHAR NOT NULL,
        status notification_status_enum NOT NULL DEFAULT 'PENDING',
        "errorMessage" TEXT,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "sentAt" TIMESTAMP
      )
    `);
    await queryRunner.query(`CREATE INDEX idx_notifications_user_id ON notifications("userId")`);
    await queryRunner.query(`CREATE INDEX idx_notifications_status ON notifications(status)`);
    await queryRunner.query(`CREATE INDEX idx_notifications_created_at ON notifications("createdAt")`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS notifications`);
    await queryRunner.query(`DROP TYPE IF EXISTS notification_status_enum`);
  }
}
