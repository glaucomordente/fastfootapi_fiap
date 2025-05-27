import 'reflect-metadata'; // Required for TypeORM decorators
import express, { Express } from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import * as winston from 'winston';
import dotenv from 'dotenv';
import { DataSource } from 'typeorm'; // Import DataSource
import { getDataSource } from './lib/typeorm';
import { CategoryModule } from './modules/categories/CategoryModule';
import { ProductModule } from './modules/products/ProductModule';
import { ClienteModule } from './modules/cliente/ClienteModule';
import { CarrinhoModule } from './modules/carrinho/CarrinhoModule';
import { OrderModule } from './modules/orders/OrderModule'; // Import OrderModule
import { PagamentoModule } from './modules/pagamento/PagamentoModule'; // Import PagamentoModule
import { runSeeds } from './database/seeds';
import setupRoutes from './routes'; // Import setupRoutes function

dotenv.config();

const app: Express = express();

winston.configure({
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/app.log' })
  ]
});

// Swagger configuration (adjust apis path if needed)
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'FastFoodAPI FIAP',
      version: '1.0.0',
      description: 'API para sistema de autoatendimento de fast food - Tech Challenge FASE 2',
    },
    servers: [
      { url: 'http://localhost:3000' }, // Base URL without /api
    ],
    // Add components schema definitions if needed for better documentation
  },
  apis: ['./src/routes/*.ts', './src/modules/**/adapters/in/web/*.ts'], // Point to route and controller files
};
const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use(express.json());

// Initialize database and start server
async function bootstrap() {
  let dataSource: DataSource;
  try {
    // Initialize TypeORM
    dataSource = await getDataSource();
    winston.info('Database connection established');

    // Run database seeds (optional, consider environment)
    // await runSeeds(dataSource);

    // Initialize modules in correct dependency order
    const categoryModule = new CategoryModule(dataSource);
    const productModule = new ProductModule(dataSource);
    const clienteModule = new ClienteModule(dataSource);
    const carrinhoModule = new CarrinhoModule(dataSource, productModule);
    const orderModule = new OrderModule(dataSource); // Initialize OrderModule (placeholder service/repo)
    const pagamentoModule = new PagamentoModule(dataSource, carrinhoModule, orderModule); // Initialize PagamentoModule
    winston.info('Modules initialized');

    // Setup routes, passing initialized modules
    const router = setupRoutes(
        categoryModule,
        productModule,
        clienteModule,
        carrinhoModule,
        pagamentoModule,
        orderModule // Pass orderModule (even if controller isn't fully ready)
    );
    app.use(router); // Use the configured router directly

    // Start server
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      winston.info(`FastFoodAPI rodando na porta ${PORT}`);
      winston.info(`API Docs disponíveis em http://localhost:${PORT}/api-docs`);
    });
  } catch (error) {
    winston.error('Failed to start the application', error);
    if (dataSource && dataSource.isInitialized) {
        await dataSource.destroy();
    }
    process.exit(1);
  }
}

bootstrap();

