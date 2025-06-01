import { MigrationInterface, QueryRunner } from "typeorm";

export class AddObservationToOrderItems1710000000001 implements MigrationInterface {
    name = 'AddObservationToOrderItems1710000000001'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order_items" ADD "observation" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order_items" DROP COLUMN "observation"`);
    }
} 