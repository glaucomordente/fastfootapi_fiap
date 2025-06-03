import { Router, Request, Response, NextFunction } from "express";
import { CategoryModule } from "../modules/categories/CategoryModule";
import { ProductModule } from "../modules/products/ProductModule";
import { CustomerModule } from "../modules/customer/CustomerModule";
import { OrderModule } from "../modules/orders/OrderModule";
import { CustomerController } from "../modules/customer/adapters/in/web/CustomerController";
import { CustomerService } from "../modules/customer/application/services/CustomerService";
import { TypeORMCustomerRepository } from "../modules/customer/adapters/out/persistence/TypeORMCustomerRepository";
import { getDataSource } from "../lib/typeorm";
import { OrderNotificationController } from "../modules/orders/adapters/in/web/OrderNotificationController";
import { OrderNotificationService } from "../modules/orders/application/services/OrderNotificationService";
import { TypeORMOrderRepository } from "../modules/orders/adapters/out/persistence/TypeORMOrderRepository";
import { PaymentController } from "../controllers antigo/PaymentController";
// import { validationMiddleware } from "../lib/validation.pipe";

/**
 * @swagger
 * tags:
 *   - name: Orders
 *     description: Order management and flow
 *   - name: Categories
 *     description: Category management
 *   - name: Products
 *     description: Product management
 *   - name: Customers
 *     description: Customer management
 *   - name: Payments
 *     description: Payment management
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
 *         - transactionId
 *         - status
 *       properties:
 *         id:
 *           type: integer
 *           description: Order ID
 *         customerId:
 *           type: string
 *           description: Customer ID (optional)
 *         transactionId:
 *           type: number
 *           description: Unique transaction ID
 *         status:
 *           type: string
 *           enum: [PENDING, PAYMENT, COMPLETED, PREPARING, READY_TO_PICKUP, DELIVERED, CANCELLED]
 *           description: Order status
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Order creation date
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update date
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
 *         observation:
 *           type: string
 *           description: Specific observations for this order item
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
 *
 *     Payment:
 *       type: object
 *       required:
 *         - orderId
 *         - amount
 *         - status
 *         - paymentMethod
 *       properties:
 *         id:
 *           type: integer
 *           description: The auto-generated ID of the payment
 *         orderId:
 *           type: integer
 *           description: The order ID
 *         amount:
 *           type: number
 *           format: float
 *           description: The paid amount
 *         status:
 *           type: string
 *           enum: [APPROVED, REJECTED]
 *           description: The payment status
 *         paymentMethod:
 *           type: string
 *           enum: [PIX, CREDIT_CARD, DEBIT_CARD]
 *           description: The payment method used
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The payment creation date
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The last update date of the payment
 *
 *     Error:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Error message
 */

/**
 * @swagger
 * /categories:
 *   get:
 *     summary: Get all categories
 *     tags: [Categories]
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
 *     summary: Create a new category
 *     tags: [Categories]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Category created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /categories/{id}:
 *   get:
 *     summary: Get a category by ID
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Category ID
 *     responses:
 *       200:
 *         description: Category details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
 *       404:
 *         description: Category not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   put:
 *     summary: Update a category
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Category ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Category updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
 *       404:
 *         description: Category not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   delete:
 *     summary: Delete a category
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Category ID
 *     responses:
 *       204:
 *         description: Category deleted successfully
 *       404:
 *         description: Category not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Get all products
 *     tags: [Products]
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
 *     summary: Create a new product
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *               - categoryId
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *                 format: float
 *               imageUrl:
 *                 type: string
 *               categoryId:
 *                 type: integer
 *               stock:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Product created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Get a product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Product not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   put:
 *     summary: Update a product
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *                 format: float
 *               imageUrl:
 *                 type: string
 *               categoryId:
 *                 type: integer
 *               stock:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Product updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Product not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   delete:
 *     summary: Delete a product
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Product ID
 *     responses:
 *       204:
 *         description: Product deleted successfully
 *       404:
 *         description: Product not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /products/category/{categoryId}:
 *   get:
 *     summary: Get products by category
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Category ID
 *     responses:
 *       200:
 *         description: List of products in the category
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 *       404:
 *         description: Category not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /customers:
 *   get:
 *     summary: Get all customers
 *     tags: [Customers]
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
 *     summary: Create a new customer
 *     tags: [Customers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - cpf
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               cpf:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       201:
 *         description: Customer created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Customer'
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /customers/{id}:
 *   get:
 *     summary: Get a customer by ID
 *     tags: [Customers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Customer ID
 *     responses:
 *       200:
 *         description: Customer details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Customer'
 *       404:
 *         description: Customer not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   put:
 *     summary: Update a customer
 *     tags: [Customers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Customer ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               cpf:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       200:
 *         description: Customer updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Customer'
 *       404:
 *         description: Customer not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   delete:
 *     summary: Delete a customer
 *     tags: [Customers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Customer ID
 *     responses:
 *       204:
 *         description: Customer deleted successfully
 *       404:
 *         description: Customer not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /customers/{id}/orders:
 *   get:
 *     summary: Get customer orders
 *     tags: [Customers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Customer ID
 *     responses:
 *       200:
 *         description: List of customer orders
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 *       404:
 *         description: Customer not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /orders:
 *   get:
 *     summary: Get all orders
 *     tags: [Orders]
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
 *     summary: Create a new order (starts as PENDING)
 *     description: |
 *       Creates a new order with PENDING status.
 *       This is the first step in the order flow.
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - items
 *             properties:
 *               customerId:
 *                 type: integer
 *                 description: Customer ID (optional)
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - productId
 *                     - quantity
 *                   properties:
 *                     productId:
 *                       type: integer
 *                     quantity:
 *                       type: integer
 *                     observation:
 *                       type: string
 *     responses:
 *       201:
 *         description: Order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /orders/{id}:
 *   get:
 *     summary: Get order by ID
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Order details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       404:
 *         description: Order not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /orders/{id}/finalize:
 *   put:
 *     summary: Finalize an order for payment (PENDING → PAYMENT)
 *     description: |
 *       Moves the order from PENDING to PAYMENT status.
 *       This is the second step in the order flow.
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Order finalized successfully and ready for payment
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       404:
 *         description: Order not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /payments/confirm:
 *   post:
 *     summary: Confirm payment and update order status (PAYMENT → COMPLETED)
 *     description: |
 *       Confirms the payment and moves the order from PAYMENT to COMPLETED status.
 *       This is the third step in the order flow.
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderId
 *             properties:
 *               orderId:
 *                 type: integer
 *                 description: ID of the order to confirm payment
 *     responses:
 *       200:
 *         description: Payment confirmed and order status updated to COMPLETED
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Payment confirmed successfully
 *                 order:
 *                   $ref: '#/components/schemas/Order'
 *       404:
 *         description: Order not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       400:
 *         description: Order is not in PAYMENT status
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /orders/{id}/prepare:
 *   put:
 *     summary: Start preparing an order (COMPLETED → PREPARING)
 *     description: |
 *       Moves the order from COMPLETED to PREPARING status.
 *       This is the fourth step in the order flow.
 *       Can only be done after payment confirmation.
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Order preparation started
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       404:
 *         description: Order not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       400:
 *         description: Order must be in COMPLETED status to start preparation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /orders/{id}/ready-for-pickup:
 *   put:
 *     summary: Mark order as ready for pickup (PREPARING → READY_TO_PICKUP)
 *     description: |
 *       Moves the order from PREPARING to READY_TO_PICKUP status.
 *       This is the fifth step in the order flow.
 *       Can only be done after preparation is complete.
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Order marked as ready for pickup
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       404:
 *         description: Order not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       400:
 *         description: Order must be in PREPARING status to be marked as ready for pickup
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /orders/{id}/confirm-pickup:
 *   put:
 *     summary: Confirm order pickup (READY_TO_PICKUP → DELIVERED)
 *     description: |
 *       Moves the order from READY_TO_PICKUP to DELIVERED status.
 *       This is the final step in the order flow.
 *       Can only be done after the order is marked as ready for pickup.
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Order pickup confirmed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       404:
 *         description: Order not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       400:
 *         description: Order must be in READY_TO_PICKUP status to confirm pickup
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /orders/{id}/cancel:
 *   put:
 *     summary: Cancel an order (can be done from any status except DELIVERED)
 *     description: |
 *       Cancels the order and moves it to CANCELLED status.
 *       This can be done at any point in the flow except when the order is DELIVERED.
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Order cancelled successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       404:
 *         description: Order not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /orders/{id}/status:
 *   put:
 *     summary: Update order status manually (for admin use)
 *     description: |
 *       Allows manual update of order status.
 *       This is an administrative endpoint and should be used with caution.
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [PENDING, PAYMENT, COMPLETED, PREPARING, READY_TO_PICKUP, DELIVERED, CANCELLED]
 *     responses:
 *       200:
 *         description: Order status updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       404:
 *         description: Order not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /orders/{id}/items:
 *   post:
 *     summary: Add item to order
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - quantity
 *             properties:
 *               productId:
 *                 type: integer
 *               quantity:
 *                 type: integer
 *               observation:
 *                 type: string
 *     responses:
 *       201:
 *         description: Item added successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       404:
 *         description: Order or product not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   delete:
 *     summary: Remove item from order
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - itemId
 *             properties:
 *               itemId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Item removed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       404:
 *         description: Order or item not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /orders/ready-to-pickup:
 *   get:
 *     summary: Get all orders that are ready for pickup
 *     description: |
 *       Returns a list of all orders that are in READY_TO_PICKUP status.
 *       These are orders that have been prepared and are waiting for customer pickup.
 *     tags: [Orders]
 *     responses:
 *       200:
 *         description: List of orders ready for pickup
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 */

/**
 * Setup routes with initialized modules
 * @param categoryModule Initialized CategoryModule
 * @param productModule Initialized ProductModule
 * @param customerModule Initialized CustomerModule
 * @returns Express router
 */
export default async function setupRoutes(
  categoryModule: CategoryModule,
  productModule: ProductModule,
  customerModule: CustomerModule
): Promise<Router> {
  const router = Router();

  // Get controllers from initialized modules
  const categoryController = categoryModule.getController();
  const productController = productModule.getController();
  const dataSource = await getDataSource();
  const customerRepository = new TypeORMCustomerRepository(dataSource);
  const customerService = new CustomerService(customerRepository);
  const customerController = new CustomerController();

  // Initialize OrderModule and get its controllers
  const orderModule = new OrderModule();
  const orderController = orderModule.getController();
  const paymentController = orderModule.getPaymentController();

  // Health check route
  router.get("/health", (req: Request, res: Response) => {
    res.status(200).json({ status: "OK" });
  });

  // Category routes
  router.get(
    "/categories",
    categoryController.getAllCategories.bind(categoryController)
  );
  router.get(
    "/categories/:id",
    categoryController.getCategoryById.bind(categoryController)
  );
  router.post(
    "/categories",
    categoryController.createCategory.bind(categoryController)
  );
  router.put(
    "/categories/:id",
    categoryController.updateCategory.bind(categoryController)
  );
  router.delete(
    "/categories/:id",
    categoryController.deleteCategory.bind(categoryController)
  );

  // Product routes
  router.get(
    "/products",
    productController.getAllProducts.bind(productController)
  );
  router.get(
    "/products/:id",
    productController.getProductById.bind(productController)
  );
  router.get(
    "/products/category/:categoryId",
    productController.getProductsByCategory.bind(productController)
  );
  router.post(
    "/products",
    productController.createProduct.bind(productController)
  );
  router.put(
    "/products/:id",
    productController.updateProduct.bind(productController)
  );
  router.delete(
    "/products/:id",
    productController.deleteProduct.bind(productController)
  );

  // Customer routes
  router.get(
    "/Customer",
    customerController.getCustomerByCpf.bind(customerController)
  );
  router.get(
    "/customers",
    customerController.getAllCustomers.bind(customerController)
  );
  router.get(
    "/customers/search",
    customerController.getCustomer.bind(customerController)
  );
  router.get(
    "/customers/:id",
    customerController.getCustomerById.bind(customerController)
  );
  router.post(
    "/customers",
    // validationMiddleware.validateCustomer,
    customerController.createCustomer.bind(customerController)
  );
  router.put(
    "/customers/:id",
    // validationMiddleware.validateCustomer,
    customerController.updateCustomer.bind(customerController)
  );
  router.delete(
    "/customers/:id",
    customerController.deleteCustomer.bind(customerController)
  );
  router.get(
    "/customers/:id/orders",
    customerController.getCustomerOrders.bind(customerController)
  );

  // Order routes
  router.get("/orders", orderController.getAllOrders.bind(orderController));
  router.get(
    "/orders/ready",
    orderController.getReadyOrders.bind(orderController)
  );
  router.get(
    "/orders/ready-to-pickup",
    orderController.getReadyToPickupOrders.bind(orderController)
  );
  router.get("/orders/:id", orderController.getOrderById.bind(orderController));
  router.post("/orders", orderController.createOrder.bind(orderController));
  router.put(
    "/orders/:id/status",
    orderController.updateOrderStatus.bind(orderController)
  );
  router.put(
    "/orders/:id/cancel",
    orderController.cancelOrder.bind(orderController)
  );
  router.put(
    "/orders/:id/finalize",
    orderController.finalizeOrder.bind(orderController)
  );
  router.put(
    "/orders/:id/prepare",
    orderController.startPreparingOrder.bind(orderController)
  );
  router.put(
    "/orders/:id/ready-for-pickup",
    orderController.markOrderReadyForPickup.bind(orderController)
  );
  router.put(
    "/orders/:id/confirm-pickup",
    orderController.confirmOrderPickup.bind(orderController)
  );
  router.post(
    "/orders/:id/items",
    orderController.addOrderItem.bind(orderController)
  );
  router.delete(
    "/orders/:id/items",
    orderController.removeOrderItem.bind(orderController)
  );

  // Payment routes
  router.post(
    "/payments/confirm",
    paymentController.confirmPayment.bind(paymentController)
  );

  // Order notification routes
  const orderRepository = new TypeORMOrderRepository(dataSource);
  const orderNotificationService = new OrderNotificationService(
    orderRepository
  );
  const orderNotificationController = new OrderNotificationController(
    orderNotificationService
  );

  return router;
}
