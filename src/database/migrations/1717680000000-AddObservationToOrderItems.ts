import { MigrationInterface, QueryRunner } from "typeorm";

export class AddObservationToOrderItems1717680000000 implements MigrationInterface {
    name = 'AddObservationToOrderItems1717680000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order_items" ADD "observation" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order_items" DROP COLUMN "observation"`);
    }
} 