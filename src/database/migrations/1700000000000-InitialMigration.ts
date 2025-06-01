import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1700000000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Criar tipos enumerados
        await queryRunner.query(`
            CREATE TYPE order_status_enum AS ENUM (
                'PENDING',
                'PREPARING',
                'READY',
                'PAYMENT',
                'COMPLETED',
                'DELIVERED',
                'CANCELLED',
                'READY_FOR_PICKUP'
            );

            CREATE TYPE payment_status_enum AS ENUM ('APPROVED', 'REJECTED');
            CREATE TYPE payment_method_enum AS ENUM ('PIX', 'CREDIT_CARD', 'DEBIT_CARD');
        `);

        // Criar tabela de clientes
        await queryRunner.query(`
            CREATE TABLE customers (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL UNIQUE,
                cpf VARCHAR(11) NOT NULL UNIQUE,
                phone VARCHAR(20),
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Criar tabela de categorias
        await queryRunner.query(`
            CREATE TABLE categories (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Criar tabela de produtos
        await queryRunner.query(`
            CREATE TABLE products (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                price DECIMAL(10,2) NOT NULL,
                image_url VARCHAR(255),
                category_id INTEGER NOT NULL REFERENCES categories(id),
                stock INTEGER NOT NULL DEFAULT 0,
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Criar tabela de pedidos
        await queryRunner.query(`
            CREATE TABLE orders (
                id SERIAL PRIMARY KEY,
                customer_id INTEGER NOT NULL REFERENCES customers(id),
                status order_status_enum NOT NULL DEFAULT 'PENDING',
                total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Criar tabela de itens do pedido
        await queryRunner.query(`
            CREATE TABLE order_items (
                id SERIAL PRIMARY KEY,
                order_id INTEGER NOT NULL REFERENCES orders(id),
                product_id INTEGER NOT NULL REFERENCES products(id),
                quantity INTEGER NOT NULL,
                unit_price DECIMAL(10,2) NOT NULL,
                observation TEXT,
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Criar tabela de pagamentos
        await queryRunner.query(`
            CREATE TABLE payments (
                id SERIAL PRIMARY KEY,
                order_id INTEGER NOT NULL REFERENCES orders(id),
                amount DECIMAL(10,2) NOT NULL,
                status payment_status_enum NOT NULL DEFAULT 'APPROVED',
                payment_method payment_method_enum NOT NULL DEFAULT 'PIX',
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remover tabelas na ordem inversa
        await queryRunner.query(`
            DROP TABLE IF EXISTS payments;
            DROP TABLE IF EXISTS order_items;
            DROP TABLE IF EXISTS orders;
            DROP TABLE IF EXISTS products;
            DROP TABLE IF EXISTS categories;
            DROP TABLE IF EXISTS customers;
        `);

        // Remover tipos enumerados
        await queryRunner.query(`
            DROP TYPE IF EXISTS payment_method_enum;
            DROP TYPE IF EXISTS payment_status_enum;
            DROP TYPE IF EXISTS order_status_enum;
        `);
    }
} 