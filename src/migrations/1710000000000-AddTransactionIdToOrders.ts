import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTransactionIdToOrders1710000000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Primeiro, tornar o customerId opcional
        await queryRunner.query(`
            ALTER TABLE orders 
            ALTER COLUMN customer_id DROP NOT NULL
        `);

        // Adicionar o campo transactionId
        await queryRunner.query(`
            ALTER TABLE orders 
            ADD COLUMN transaction_id INTEGER UNIQUE
        `);

        // Preencher o transactionId para registros existentes
        await queryRunner.query(`
            UPDATE orders 
            SET transaction_id = id 
            WHERE transaction_id IS NULL
        `);

        // Tornar o transactionId NOT NULL após preencher os dados
        await queryRunner.query(`
            ALTER TABLE orders 
            ALTER COLUMN transaction_id SET NOT NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remover o campo transactionId
        await queryRunner.query(`
            ALTER TABLE orders 
            DROP COLUMN transaction_id
        `);

        // Tornar o customerId obrigatório novamente
        await queryRunner.query(`
            ALTER TABLE orders 
            ALTER COLUMN customer_id SET NOT NULL
        `);
    }
} 