const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const productController = require('../controllers/productController');
const orderController = require('../controllers/orderController');
const customerController = require('../controllers/customerController');
// const { ValidationPipe } = require('../lib/validation.pipe');
const { CustomerEntity } = require('../modules/customer/adapters/out/persistence/entities/Customer.entity');

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
 *         observation:
 *           type: string
 *           description: Observações específicas para este item do pedido
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
 *     OrderStatus:
 *       type: string
 *       enum: [PENDING, PREPARING, READY, COMPLETED, CANCELLED]
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
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
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
 *         description: Category created
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
 * 
 * /categories/{id}:
 *   get:
 *     tags: [Categories]
 *     summary: Get category by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Category ID
 *     responses:
 *       200:
 *         description: Category found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
 *       404:
 *         description: Category not found
 *   put:
 *     tags: [Categories]
 *     summary: Update category
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
 *             $ref: '#/components/schemas/Category'
 *     responses:
 *       200:
 *         description: Category updated
 *       404:
 *         description: Category not found
 *   delete:
 *     tags: [Categories]
 *     summary: Delete category
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Category ID
 *     responses:
 *       204:
 *         description: Category deleted
 *       404:
 *         description: Category not found
 * 
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
 *         description: Product created
 * 
 * /products/{id}:
 *   get:
 *     tags: [Products]
 *     summary: Get product by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product found
 *       404:
 *         description: Product not found
 *   put:
 *     tags: [Products]
 *     summary: Update product
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
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       200:
 *         description: Product updated
 *       404:
 *         description: Product not found
 *   delete:
 *     tags: [Products]
 *     summary: Delete product
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Product ID
 *     responses:
 *       204:
 *         description: Product deleted
 *       404:
 *         description: Product not found
 * 
 * /products/category/{categoryId}:
 *   get:
 *     tags: [Products]
 *     summary: Get products by category
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Category ID
 *     responses:
 *       200:
 *         description: List of products in category
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 * 
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
 *     summary: Iniciar um novo pedido
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - customerId
 *             properties:
 *               customerId:
 *                 type: integer
 *                 description: ID do cliente que fez o pedido
 *               items:
 *                 type: array
 *                 description: Lista de itens do pedido (opcional)
 *                 items:
 *                   type: object
 *                   required:
 *                     - productId
 *                     - quantity
 *                   properties:
 *                     productId:
 *                       type: integer
 *                       description: ID do produto
 *                     quantity:
 *                       type: integer
 *                       description: Quantidade do produto
 *                     observation:
 *                       type: string
 *                       description: Observações específicas para este item do pedido
 *     responses:
 *       201:
 *         description: Pedido iniciado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: ID do pedido criado
 *                 customerId:
 *                   type: integer
 *                   description: ID do cliente
 *                 status:
 *                   type: string
 *                   enum: [PENDING, PREPARING, READY, COMPLETED, CANCELLED]
 *                   description: Status do pedido
 *                 totalAmount:
 *                   type: number
 *                   format: float
 *                   description: Valor total do pedido (0.00 se não houver itens)
 *                 items:
 *                   type: array
 *                   description: Lista de itens do pedido (vazia se não houver itens)
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: ID do item do pedido
 *                       productId:
 *                         type: integer
 *                         description: ID do produto
 *                       quantity:
 *                         type: integer
 *                         description: Quantidade do produto
 *                       unitPrice:
 *                         type: number
 *                         format: float
 *                         description: Preço unitário do produto
 *                       observation:
 *                         type: string
 *                         description: Observações específicas para este item do pedido
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Cliente não encontrado
 *       500:
 *         description: Erro interno do servidor
 * 
 * /orders/{id}:
 *   get:
 *     tags: [Orders]
 *     summary: Get order by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order found
 *       404:
 *         description: Order not found
 * 
 * /orders/{id}/status:
 *   put:
 *     tags: [Orders]
 *     summary: Update order status
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Order ID
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
 *                 $ref: '#/components/schemas/OrderStatus'
 *     responses:
 *       200:
 *         description: Order status updated
 *       404:
 *         description: Order not found
 * 
 * /orders/{id}/cancel:
 *   put:
 *     tags: [Orders]
 *     summary: Cancel order
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order cancelled
 *       404:
 *         description: Order not found
 * 
 * /orders/{id}/finalize:
 *   put:
 *     tags: [Orders]
 *     summary: Finalize order
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order finalized
 *       404:
 *         description: Order not found
 * 
 * /orders/ready:
 *   get:
 *     tags: [Orders]
 *     summary: Listar pedidos prontos
 *     description: Retorna todos os pedidos com status READY
 *     responses:
 *       200:
 *         description: Lista de pedidos prontos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Mensagem de erro
 * 
 * /orders/{id}/prepare:
 *   put:
 *     tags: [Orders]
 *     summary: Iniciar preparo do pedido
 *     description: Altera o status do pedido para PREPARING
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do pedido
 *     responses:
 *       200:
 *         description: Pedido iniciado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       400:
 *         description: Erro de validação
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Mensagem de erro
 *       404:
 *         description: Pedido não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Mensagem de erro
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Mensagem de erro
 * 
 * /orders/{id}/items:
 *   post:
 *     tags: [Orders]
 *     summary: Adicionar item a um pedido
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do pedido
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *             properties:
 *               productId:
 *                 type: integer
 *                 description: ID do produto a ser adicionado
 *               observation:
 *                 type: string
 *                 description: Observações específicas para este item do pedido
 *     responses:
 *       201:
 *         description: Item adicionado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       400:
 *         description: Dados inválidos ou pedido cancelado/completo
 *       404:
 *         description: Pedido ou produto não encontrado
 *       500:
 *         description: Erro interno do servidor
 *   delete:
 *     tags: [Orders]
 *     summary: Remover item de um pedido
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do pedido
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
 *                 description: ID do item a ser removido do pedido
 *     responses:
 *       200:
 *         description: Item removido com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       400:
 *         description: Dados inválidos ou pedido cancelado/completo
 *       404:
 *         description: Pedido ou item não encontrado
 *       500:
 *         description: Erro interno do servidor
 * 
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
 *         description: Customer created
 * 
 * /customers/{id}:
 *   get:
 *     tags: [Customers]
 *     summary: Get customer by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Customer ID
 *     responses:
 *       200:
 *         description: Customer found
 *       404:
 *         description: Customer not found
 *   put:
 *     tags: [Customers]
 *     summary: Update customer
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
 *             $ref: '#/components/schemas/Customer'
 *     responses:
 *       200:
 *         description: Customer updated
 *       404:
 *         description: Customer not found
 *   delete:
 *     tags: [Customers]
 *     summary: Delete customer
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Customer ID
 *     responses:
 *       204:
 *         description: Customer deleted
 *       404:
 *         description: Customer not found
 * 
 * /customers/{id}/orders:
 *   get:
 *     tags: [Customers]
 *     summary: Get customer orders
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
 * 
 * /customers/search:
 *   get:
 *     tags: [Customers]
 *     summary: Search customer by email or CPF
 *     parameters:
 *       - in: query
 *         name: email
 *         schema:
 *           type: string
 *         description: Customer email
 *       - in: query
 *         name: cpf
 *         schema:
 *           type: string
 *         description: Customer CPF
 *     responses:
 *       200:
 *         description: Customer found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Customer'
 *       400:
 *         description: Email or CPF is required
 *       404:
 *         description: Customer not found
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
  router.get('/orders/ready', orderController.getReadyOrders);
  router.post('/orders', orderController.createOrder);
  router.get('/orders/:id', orderController.getOrderById);
  router.put('/orders/:id/status', orderController.updateOrderStatus);
  router.put('/orders/:id/cancel', orderController.cancelOrder);
  router.put('/orders/:id/finalize', orderController.finalizeOrder);
  router.put('/orders/:id/prepare', orderController.startPreparingOrder);
  router.post('/orders/:id/items', orderController.addOrderItem);
  router.delete('/orders/:id/items', orderController.removeOrderItem);

  // Customer routes with validation
  router.get('/customers', customerController.getAllCustomers);
  router.post('/customers', customerController.createCustomer);
  router.get('/customers/search', customerController.getCustomer);
  router.get('/customers/:id', customerController.getCustomerById);
  router.put('/customers/:id', customerController.updateCustomer);
  router.delete('/customers/:id', customerController.deleteCustomer);
  router.get('/customers/:id/orders', customerController.getCustomerOrders);

  return router;
}

module.exports = setupRoutes;
