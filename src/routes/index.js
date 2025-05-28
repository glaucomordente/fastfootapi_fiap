const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const productController = require('../controllers/productController');
const orderController = require('../controllers/orderController');
const customerController = require('../controllers/customerController');

/**
 * @swagger
 * tags:
 *   - name: Categories
 *     description: Category management
 *   - name: Products
 *     description: Product management
 *   - name: Orders
 *     description: Order management
 *   - name: Customers
 *     description: Customer management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Category:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         id:
 *           type: integer
 *           description: The auto-generated id of the category
 *         name:
 *           type: string
 *           description: The name of the category
 *         description:
 *           type: string
 *           description: The description of the category
 *     
 *     Product:
 *       type: object
 *       required:
 *         - name
 *         - price
 *         - categoryId
 *       properties:
 *         id:
 *           type: integer
 *           description: The auto-generated id of the product
 *         name:
 *           type: string
 *           description: The name of the product
 *         description:
 *           type: string
 *           description: The description of the product
 *         price:
 *           type: number
 *           format: float
 *           description: The price of the product
 *         imageUrl:
 *           type: string
 *           description: URL to the product image
 *         categoryId:
 *           type: integer
 *           description: The category ID this product belongs to
 *         stock:
 *           type: integer
 *           description: The available stock quantity
 *     
 *     Order:
 *       type: object
 *       required:
 *         - customerName
 *         - items
 *       properties:
 *         id:
 *           type: integer
 *           description: The auto-generated id of the order
 *         customerName:
 *           type: string
 *           description: The name of the customer
 *         status:
 *           type: string
 *           enum: [PENDING, PREPARING, READY, COMPLETED, CANCELLED]
 *           description: The status of the order
 *         totalAmount:
 *           type: number
 *           format: float
 *           description: The total amount of the order
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/OrderItem'
 *     
 *     OrderItem:
 *       type: object
 *       required:
 *         - productId
 *         - quantity
 *       properties:
 *         id:
 *           type: integer
 *           description: The auto-generated id of the order item
 *         productId:
 *           type: integer
 *           description: The product ID
 *         quantity:
 *           type: integer
 *           description: The quantity of the product
 *         unitPrice:
 *           type: number
 *           format: float
 *           description: The unit price of the product
 *     
 *     Customer:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - cpf
 *       properties:
 *         id:
 *           type: integer
 *           description: The auto-generated id of the customer
 *         name:
 *           type: string
 *           description: The name of the customer
 *         email:
 *           type: string
 *           description: The email of the customer
 *         cpf:
 *           type: string
 *           description: The CPF (Brazilian tax ID) of the customer
 *         phone:
 *           type: string
 *           description: The phone number of the customer
 */

/**
 * @swagger
 * /categories:
 *   get:
 *     tags: [Categories]
 *     summary: Get all categories
 *     responses:
 *       200:
 *         description: List of categories
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Category'
 *   post:
 *     tags: [Categories]
 *     summary: Create a new category
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Category'
 *     responses:
 *       201:
 *         description: Category created successfully
 */

/**
 * @swagger
 * /products:
 *   get:
 *     tags: [Products]
 *     summary: Get all products
 *     responses:
 *       200:
 *         description: List of products
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 *   post:
 *     tags: [Products]
 *     summary: Create a new product
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       201:
 *         description: Product created successfully
 */

/**
 * @swagger
 * /orders:
 *   get:
 *     tags: [Orders]
 *     summary: Get all orders
 *     responses:
 *       200:
 *         description: List of orders
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 *   post:
 *     tags: [Orders]
 *     summary: Create a new order
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Order'
 *     responses:
 *       201:
 *         description: Order created successfully
 */

/**
 * @swagger
 * /customers:
 *   get:
 *     tags: [Customers]
 *     summary: Get all customers
 *     responses:
 *       200:
 *         description: List of customers
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Customer'
 *   post:
 *     tags: [Customers]
 *     summary: Create a new customer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Customer'
 *     responses:
 *       201:
 *         description: Customer created successfully
 */

function setupRoutes(categoryModule, productModule, customerModule) {
  router.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK' });
  });

  // Categories routes
  router.get('/categories', categoryController.getAllCategories);
  router.post('/categories', categoryController.createCategory);
  router.get('/categories/:id', categoryController.getCategoryById);
  router.put('/categories/:id', categoryController.updateCategory);
  router.delete('/categories/:id', categoryController.deleteCategory);

  // Products routes
  router.get('/products', productController.getAllProducts);
  router.post('/products', productController.createProduct);
  router.get('/products/:id', productController.getProductById);
  router.put('/products/:id', productController.updateProduct);
  router.delete('/products/:id', productController.deleteProduct);
  router.get('/products/category/:categoryId', productController.getProductsByCategory);

  // Orders routes
  router.get('/orders', orderController.getAllOrders);
  router.post('/orders', orderController.createOrder);
  router.get('/orders/:id', orderController.getOrderById);
  router.put('/orders/:id/status', orderController.updateOrderStatus);
  router.put('/orders/:id/cancel', orderController.cancelOrder);

  // Customer routes
  router.get('/customers', customerController.getAllCustomers);
  router.post('/customers', customerController.createCustomer);
  router.get('/customers/:id', customerController.getCustomerById);
  router.put('/customers/:id', customerController.updateCustomer);
  router.delete('/customers/:id', customerController.deleteCustomer);
  router.get('/customers/:id/orders', customerController.getCustomerOrders);

  return router;
}

module.exports = setupRoutes;
