import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTransactionIdToOrders1710000000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // First add the column as nullable
    await queryRunner.query(
      `ALTER TABLE "orders" ADD "transaction_id" integer`
    );

    // Update existing records with a default value (using a sequence)
    await queryRunner.query(`
            CREATE SEQUENCE IF NOT EXISTS orders_transaction_id_seq;
            UPDATE "orders" SET "transaction_id" = nextval('orders_transaction_id_seq');
        `);

    // Now make the column NOT NULL
    await queryRunner.query(
      `ALTER TABLE "orders" ALTER COLUMN "transaction_id" SET NOT NULL`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove the column
    await queryRunner.query(
      `ALTER TABLE "orders" DROP COLUMN "transaction_id"`
    );

    // Drop the sequence
    await queryRunner.query(
      `DROP SEQUENCE IF EXISTS orders_transaction_id_seq`
    );
  }
}
