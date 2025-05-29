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
      description: "API para sistema de autoatendimento de fast food",
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
    path.resolve(__dirname, "./routes/index.js"),
    path.resolve(__dirname, "./controllers/*.ts"),
  ],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Enable CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});

app.use(express.json());

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

    await categoryModule.initialize();
    await productModule.initialize();
    await customerModule.initialize();
    winston.info("Modules initialized");

    // Setup routes
    const setupRoutes = require("./routes");
    app.use("/api", setupRoutes(categoryModule, productModule, customerModule));

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
