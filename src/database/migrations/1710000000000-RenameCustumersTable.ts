import { MigrationInterface, QueryRunner } from "typeorm";

export class RenameCustumersTable1710000000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.renameTable("custumers", "customers");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.renameTable("customers", "custumers");
    }
} 