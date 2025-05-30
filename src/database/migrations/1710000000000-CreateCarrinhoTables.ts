import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateCarrinhoTables1710000000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Criar tabela de carrinhos
        await queryRunner.createTable(
            new Table({
                name: "carrinhos",
                columns: [
                    {
                        name: "id",
                        type: "uuid",
                        isPrimary: true,
                        default: "uuid_generate_v4()"
                    },
                    {
                        name: "id_sessao",
                        type: "uuid",
                        isUnique: true
                    },
                    {
                        name: "subtotal",
                        type: "decimal",
                        precision: 10,
                        scale: 2,
                        default: 0
                    },
                    {
                        name: "total",
                        type: "decimal",
                        precision: 10,
                        scale: 2,
                        default: 0
                    },
                    {
                        name: "status",
                        type: "varchar",
                        length: "20",
                        default: "'ativo'"
                    },
                    {
                        name: "created_at",
                        type: "timestamp",
                        default: "now()"
                    },
                    {
                        name: "updated_at",
                        type: "timestamp",
                        default: "now()"
                    }
                ]
            })
        );

        // Criar tabela de itens do carrinho
        await queryRunner.createTable(
            new Table({
                name: "itens_carrinho",
                columns: [
                    {
                        name: "id",
                        type: "uuid",
                        isPrimary: true,
                        default: "uuid_generate_v4()"
                    },
                    {
                        name: "carrinho_id",
                        type: "uuid"
                    },
                    {
                        name: "produto_id",
                        type: "uuid"
                    },
                    {
                        name: "quantidade",
                        type: "integer"
                    },
                    {
                        name: "observacoes",
                        type: "varchar",
                        length: "500",
                        isNullable: true
                    },
                    {
                        name: "subtotal",
                        type: "decimal",
                        precision: 10,
                        scale: 2
                    },
                    {
                        name: "created_at",
                        type: "timestamp",
                        default: "now()"
                    },
                    {
                        name: "updated_at",
                        type: "timestamp",
                        default: "now()"
                    }
                ]
            })
        );

        // Adicionar chaves estrangeiras
        await queryRunner.createForeignKey(
            "itens_carrinho",
            new TableForeignKey({
                columnNames: ["carrinho_id"],
                referencedColumnNames: ["id"],
                referencedTableName: "carrinhos",
                onDelete: "CASCADE"
            })
        );

        await queryRunner.createForeignKey(
            "itens_carrinho",
            new TableForeignKey({
                columnNames: ["produto_id"],
                referencedColumnNames: ["id"],
                referencedTableName: "products",
                onDelete: "CASCADE"
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remover chaves estrangeiras primeiro
        const table = await queryRunner.getTable("itens_carrinho");
        const foreignKeys = table?.foreignKeys || [];
        
        for (const foreignKey of foreignKeys) {
            await queryRunner.dropForeignKey("itens_carrinho", foreignKey);
        }

        // Remover tabelas
        await queryRunner.dropTable("itens_carrinho");
        await queryRunner.dropTable("carrinhos");
    }
} 