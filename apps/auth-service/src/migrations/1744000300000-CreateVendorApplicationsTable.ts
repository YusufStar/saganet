import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreateVendorApplicationsTable1744000300000 implements MigrationInterface {
  name = 'CreateVendorApplicationsTable1744000300000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enum type
    await queryRunner.query(
      `CREATE TYPE "vendor_application_status_enum" AS ENUM ('PENDING', 'APPROVED', 'REJECTED')`,
    );

    await queryRunner.createTable(
      new Table({
        name: 'vendor_applications',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          { name: 'userId', type: 'uuid', isNullable: false },
          {
            name: 'status',
            type: 'vendor_application_status_enum',
            default: "'PENDING'",
          },

          // Personal
          { name: 'firstName', type: 'varchar', length: '50', isNullable: false },
          { name: 'lastName', type: 'varchar', length: '50', isNullable: false },
          { name: 'identityNumber', type: 'varchar', length: '11', isNullable: false },
          { name: 'phone', type: 'varchar', length: '20', isNullable: false },

          // Company
          { name: 'companyName', type: 'varchar', length: '200', isNullable: false },
          { name: 'companyType', type: 'varchar', length: '50', isNullable: false },
          { name: 'taxNumber', type: 'varchar', length: '20', isNullable: true },
          { name: 'taxOffice', type: 'varchar', length: '100', isNullable: true },

          // Address
          { name: 'street', type: 'varchar', length: '255', isNullable: false },
          { name: 'district', type: 'varchar', length: '100', isNullable: true },
          { name: 'city', type: 'varchar', length: '100', isNullable: false },
          { name: 'postalCode', type: 'varchar', length: '20', isNullable: true },

          // Bank
          { name: 'iban', type: 'varchar', length: '34', isNullable: false },
          { name: 'bankName', type: 'varchar', length: '100', isNullable: true },

          // About
          { name: 'about', type: 'text', isNullable: true },

          // Documents
          { name: 'identityDocumentUrl', type: 'varchar', length: '2048', isNullable: true },
          { name: 'taxDocumentUrl', type: 'varchar', length: '2048', isNullable: true },
          { name: 'signatureCircularUrl', type: 'varchar', length: '2048', isNullable: true },

          // Review
          { name: 'reviewedBy', type: 'uuid', isNullable: true },
          { name: 'reviewedAt', type: 'timestamp', isNullable: true },
          { name: 'rejectionReason', type: 'text', isNullable: true },

          // Timestamps
          { name: 'createdAt', type: 'timestamp', default: 'now()' },
          { name: 'updatedAt', type: 'timestamp', default: 'now()' },
          { name: 'deletedAt', type: 'timestamp', isNullable: true },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'vendor_applications',
      new TableIndex({ name: 'IDX_vendor_applications_userId', columnNames: ['userId'] }),
    );

    await queryRunner.createIndex(
      'vendor_applications',
      new TableIndex({ name: 'IDX_vendor_applications_status', columnNames: ['status'] }),
    );

    await queryRunner.createForeignKey(
      'vendor_applications',
      new TableForeignKey({
        name: 'FK_vendor_applications_userId',
        columnNames: ['userId'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('vendor_applications', 'FK_vendor_applications_userId');
    await queryRunner.dropIndex('vendor_applications', 'IDX_vendor_applications_status');
    await queryRunner.dropIndex('vendor_applications', 'IDX_vendor_applications_userId');
    await queryRunner.dropTable('vendor_applications');
    await queryRunner.query(`DROP TYPE "vendor_application_status_enum"`);
  }
}
