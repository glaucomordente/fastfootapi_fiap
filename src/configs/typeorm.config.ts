import { DataSource } from 'typeorm';
import dotenv from 'dotenv';

dotenv.config();

const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    entities: [
        'src/database/entities/*.ts',
        'src/modules/**/adapters/out/persistence/entities/*.ts'
    ],
    migrations: ['src/database/migrations/*.ts'],
    synchronize: false,
});

export default AppDataSource; 