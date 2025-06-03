import "reflect-metadata"; // Required for TypeORM decorators
import express, { Express, Request, Response } from "express";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
import * as winston from "winston";
import dotenv from "dotenv";
import { getDataSource } from "./lib/typeorm";
import { CategoryModule } from "./modules/categories/CategoryModule";
import { ProductModule } from "./modules/products/ProductModule";
import { CustomerModule } from "./modules/customer/CustomerModule";
import { OrderModule } from "./modules/orders/OrderModule";
import { PaymentModule } from "./modules/payments/PaymentModule";
import { runSeeds } from "./database/seeds";
import path from "path";

dotenv.config();

const app: Express = express();

winston.configure({
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "logs/app.log" }),
  ],
});

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "FastFoodAPI",
      version: "1.0.0",
      description: "API for fast food self-service system",
    },
    servers: [
      {
        url: "http://localhost:3000/api",
        description: "Development server",
      },
    ],
    components: {
      schemas: {
        Error: {
          type: "object",
          properties: {
            error: {
              type: "string",
              description: "Error message",
            },
          },
        },
      },
    },
  },
  apis: [
    path.resolve(__dirname, "./routes/index.ts"),
    path.resolve(__dirname, "./modules/**/adapters/in/web/*.ts"),
  ],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Enable CORS and JSON parsing
app.use(express.json());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});

// Initialize database and start server
async function bootstrap() {
  try {
    // Initialize TypeORM
    const dataSource = await getDataSource();
    winston.info("Database connection established");

    // Run database seeds
    await runSeeds(dataSource);

    // Initialize modules
    const categoryModule = new CategoryModule();
    const productModule = new ProductModule();
    const customerModule = new CustomerModule();
    const orderModule = new OrderModule();
    const paymentModule = new PaymentModule();

    await categoryModule.initialize();
    await productModule.initialize();
    winston.info("Modules initialized");

    // Setup routes
    // Import the routes directly from the TypeScript file
    const setupRoutes = (await import("./routes")).default;
    app.use("/api", await setupRoutes(
      categoryModule, 
      productModule, 
      customerModule,
      orderModule,
      paymentModule
    ));

    // Start server
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      winston.info(`FastFoodAPI running on port ${PORT}`);
      winston.info(
        `Swagger documentation available at http://localhost:${PORT}/api-docs`
      );
    });
  } catch (error) {
    winston.error("Failed to start the application", error);
    process.exit(1);
  }
}

bootstrap();
