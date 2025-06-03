import { Router, Request, Response, RequestHandler } from "express";
import { CategoryModule } from "../modules/categories/CategoryModule";
import { ProductModule } from "../modules/products/ProductModule";
import { CustomerModule } from "../modules/customer/CustomerModule";
import { OrderModule } from "../modules/orders/OrderModule";
import { PaymentModule } from "../modules/payments/PaymentModule";

// Helper function to cast controller functions to RequestHandler
const asHandler = (handler: any): RequestHandler => handler as RequestHandler;

export default async function setupRoutes(
  categoryModule: CategoryModule, 
  productModule: ProductModule, 
  customerModule: CustomerModule,
  orderModule: OrderModule = new OrderModule(),
  paymentModule: PaymentModule = new PaymentModule()
) {
  const router = Router();
  
  // Get controllers from modules
  const categoryController = categoryModule.getController();
  const productController = productModule.getController();
  const customerController = customerModule.getController();
  const orderController = orderModule.getController();
  const orderNotificationController = await orderModule.getOrderNotificationController();
  const paymentController = paymentModule.getPaymentController();

  /**
   * @swagger
   * /health:
   *   get:
   *     summary: Health check endpoint
   *     description: Use to check if the API is running
   *     tags: [Health]
   *     responses:
   *       200:
   *         description: API is running
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: string
   *                   example: OK
   */
  router.get('/health', (req: Request, res: Response) => {
    res.status(200).json({ status: 'OK' });
  });

  // Categories routes
  router.get('/categories', asHandler(categoryController.getAllCategories.bind(categoryController)));
  router.post('/categories', asHandler(categoryController.createCategory.bind(categoryController)));
  router.get('/categories/:id', asHandler(categoryController.getCategoryById.bind(categoryController)));
  router.put('/categories/:id', asHandler(categoryController.updateCategory.bind(categoryController)));
  router.delete('/categories/:id', asHandler(categoryController.deleteCategory.bind(categoryController)));

  // Products routes
  router.get('/products', asHandler(productController.getAllProducts.bind(productController)));
  router.post('/products', asHandler(productController.createProduct.bind(productController)));
  router.get('/products/:id', asHandler(productController.getProductById.bind(productController)));
  router.put('/products/:id', asHandler(productController.updateProduct.bind(productController)));
  router.delete('/products/:id', asHandler(productController.deleteProduct.bind(productController)));
  router.get('/products/category/:categoryId', asHandler(productController.getProductsByCategory.bind(productController)));

  // Orders routes
  router.get('/orders', asHandler(orderController.getAllOrders.bind(orderController)));
  router.get('/orders/ready', asHandler(orderController.getReadyOrders.bind(orderController)));
  router.post('/orders', asHandler(orderController.createOrder.bind(orderController)));
  router.get('/orders/:id', asHandler(orderController.getOrderById.bind(orderController)));
  router.put('/orders/:id/status', asHandler(orderController.updateOrderStatus.bind(orderController)));
  router.put('/orders/:id/cancel', asHandler(orderController.cancelOrder.bind(orderController)));
  router.put('/orders/:id/finalize', asHandler(orderController.finalizeOrder.bind(orderController)));
  router.put('/orders/:id/prepare', asHandler(orderController.startPreparingOrder.bind(orderController)));
  router.put('/orders/:id/complete', asHandler(orderController.completeOrder.bind(orderController)));
  router.put('/orders/:id/confirm-pickup', asHandler(orderController.confirmOrderPickup.bind(orderController)));
  router.post('/orders/:id/items', asHandler(orderController.addOrderItem.bind(orderController)));
  router.delete('/orders/:id/items', asHandler(orderController.removeOrderItem.bind(orderController)));
  router.post('/orders/:orderId/notify-ready', asHandler(orderNotificationController.notifyOrderReady.bind(orderNotificationController)));

  // Customer routes
  router.get('/customers', asHandler(customerController.getAllCustomers.bind(customerController)));
  router.post('/customers', asHandler(customerController.createCustomer.bind(customerController)));
  router.get('/customers/search', asHandler(customerController.getCustomer.bind(customerController)));
  router.get('/customers/:id', asHandler(customerController.getCustomerById.bind(customerController)));
  router.put('/customers/:id', asHandler(customerController.updateCustomer.bind(customerController)));
  router.delete('/customers/:id', asHandler(customerController.deleteCustomer.bind(customerController)));
  router.get('/customers/:id/orders', asHandler(customerController.getCustomerOrders.bind(customerController)));

  // Payment routes
  router.post('/payments/confirm', asHandler(paymentController.confirmPayment.bind(paymentController)));

  return router;
}
