import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSagaStatesTable1744100002000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE saga_step_enum AS ENUM (
        'STARTED','INVENTORY_RESERVE_SENT','INVENTORY_RESERVED',
        'PAYMENT_CHARGE_SENT','PAYMENT_COMPLETED',
        'COMPLETED','COMPENSATING','FAILED'
      )
    `);
    await queryRunner.query(`
      CREATE TYPE saga_status_enum AS ENUM ('RUNNING','COMPLETED','FAILED')
    `);
    await queryRunner.query(`
      CREATE TABLE saga_states (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "orderId" UUID NOT NULL UNIQUE,
        step saga_step_enum NOT NULL DEFAULT 'STARTED',
        status saga_status_enum NOT NULL DEFAULT 'RUNNING',
        payload JSONB,
        "timeoutAt" TIMESTAMP,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP
      )
    `);
    await queryRunner.query(`CREATE INDEX idx_saga_states_order_id ON saga_states("orderId")`);
    await queryRunner.query(`CREATE INDEX idx_saga_states_status ON saga_states(status)`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS saga_states`);
    await queryRunner.query(`DROP TYPE IF EXISTS saga_step_enum`);
    await queryRunner.query(`DROP TYPE IF EXISTS saga_status_enum`);
  }
}
