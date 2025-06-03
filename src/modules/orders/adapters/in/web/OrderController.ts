import { Request, Response } from 'express';
import { getDataSource } from '../../../../../lib/typeorm';
import { OrderEntity } from '../../out/persistence/entities/Order.entity';
import { OrderItemEntity } from '../../out/persistence/entities/OrderItem.entity';
import { ProductEntity } from '../../../../products/adapters/out/persistence/entities/Product.entity';
import { OrderStatus } from '../../../domain/entities/Order';
import { CustomerEntity } from '../../../../customer/adapters/out/persistence/entities/Customer.entity';
import { OrderUseCase } from '../../../domain/ports/in/OrderUseCase';

/**
 * @swagger
 * components:
 *   schemas:
 *     OrderItem:
 *       type: object
 *       required:
 *         - productId
 *         - quantity
 *       properties:
 *         id:
 *           type: integer
 *           description: The order item ID
 *         orderId:
 *           type: integer
 *           description: The ID of the order this item belongs to
 *         productId:
 *           type: integer
 *           description: The ID of the product
 *         quantity:
 *           type: integer
 *           description: The quantity of the product
 *         unitPrice:
 *           type: number
 *           format: float
 *           description: The unit price of the product
 *         observation:
 *           type: string
 *           description: Optional observation for the item
 *       example:
 *         id: 1
 *         orderId: 1
 *         productId: 1
 *         quantity: 2
 *         unitPrice: 12.99
 *         observation: No pickles
 *
 *     Order:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: The order ID
 *         customerId:
 *           type: integer
 *           description: The ID of the customer who placed the order (optional)
 *         transactionId:
 *           type: integer
 *           description: Unique transaction identifier
 *         status:
 *           type: string
 *           enum: [PAYMENT_PENDING, PAID, IN_PREPARATION, READY_FOR_PICKUP, PICKED_UP, CANCELED]
 *           description: The current status of the order
 *         totalAmount:
 *           type: number
 *           format: float
 *           description: The total amount of the order
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/OrderItem'
 *           description: The items in the order
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date and time when the order was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The date and time when the order was last updated
 *       example:
 *         id: 1
 *         customerId: 1
 *         transactionId: 1001
 *         status: PAID
 *         totalAmount: 25.98
 *         createdAt: "2023-01-01T12:00:00Z"
 *         updatedAt: "2023-01-01T12:05:00Z"
 */

/**
 * OrderController
 * 
 * This controller handles HTTP requests related to orders.
 * It follows the hexagonal architecture pattern as an input adapter.
 */
export class OrderController {
  constructor(private orderUseCase?: OrderUseCase) {}

  /**
   * @swagger
   * /orders:
   *   get:
   *     summary: Returns all orders
   *     tags: [Orders]
   *     responses:
   *       200:
   *         description: The list of orders
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/Order'
   *       500:
   *         description: Internal server error
   */
  async getAllOrders(req: Request, res: Response): Promise<Response> {
    try {
      const dataSource = await getDataSource();
      const orderRepository = dataSource.getRepository(OrderEntity);
      const orders = await orderRepository.find({
        relations: ['items', 'items.product', 'customer']
      });
      return res.status(200).json(orders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * @swagger
   * /orders/{id}:
   *   get:
   *     summary: Get an order by id
   *     tags: [Orders]
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: integer
   *         required: true
   *         description: The order id
   *     responses:
   *       200:
   *         description: The order
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Order'
   *       404:
   *         description: Order not found
   *       500:
   *         description: Internal server error
   */
  async getOrderById(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const dataSource = await getDataSource();
      const orderRepository = dataSource.getRepository(OrderEntity);
      const order = await orderRepository.findOne({
        where: { id: Number(id) },
        relations: ['items', 'items.product', 'customer']
      });
      
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }
      
      return res.status(200).json(order);
    } catch (error) {
      console.error('Error fetching order:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * @swagger
   * /orders:
   *   post:
   *     summary: Create a new order
   *     tags: [Orders]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               customerId:
   *                 type: integer
   *                 description: The ID of the customer (optional)
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
   *                       description: The ID of the product
   *                     quantity:
   *                       type: integer
   *                       description: The quantity of the product
   *                     observation:
   *                       type: string
   *                       description: Optional observation for the item
   *     responses:
   *       201:
   *         description: The created order
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Order'
   *       400:
   *         description: Bad request - missing required fields or validation error
   *       404:
   *         description: Customer or product not found
   *       500:
   *         description: Internal server error
   */
  async createOrder(req: Request, res: Response): Promise<Response> {
    try {
      const { customerId, items = [] } = req.body;
      
      const dataSource = await getDataSource();
      const productRepository = dataSource.getRepository(ProductEntity);
      const orderRepository = dataSource.getRepository(OrderEntity);
      const orderItemRepository = dataSource.getRepository(OrderItemEntity);
      const customerRepository = dataSource.getRepository(CustomerEntity);
      
      // Start a transaction
      const queryRunner = dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();
      
      try {
        // Validate customer exists if customerId is provided
        if (customerId) {
          const customer = await customerRepository.findOne({
            where: { id: Number(customerId) }
          });
          
          if (!customer) {
            return res.status(404).json({ error: `Customer with ID ${customerId} not found` });
          }
        }

        // Generate unique transactionId
        const lastOrder = await orderRepository.findOne({
          order: { transactionId: 'DESC' },
          where: {} // Adding empty condition to avoid error
        });
        const transactionId = lastOrder ? lastOrder.transactionId + 1 : 1;

        // Validate products and calculate total amount
        let totalAmount = 0;
        const orderItems: OrderItemEntity[] = [];
        
        if (Array.isArray(items) && items.length > 0) {
          for (const item of items) {
            const { productId, quantity, observation } = item;
            
            if (!productId || !quantity || quantity <= 0) {
              return res.status(400).json({ error: 'Each item must have a valid productId and quantity' });
            }
            
            // Check if product exists and has enough stock
            const product = await productRepository.findOne({
              where: { id: Number(productId) }
            });
            
            if (!product) {
              return res.status(404).json({ error: `Product with ID ${productId} not found` });
            }
            
            if (product.stock < quantity) {
              return res.status(400).json({ error: `Not enough stock for product ${product.name}` });
            }
            
            // Create order item
            const orderItem = new OrderItemEntity();
            orderItem.productId = Number(productId);
            orderItem.quantity = Number(quantity);
            orderItem.unitPrice = product.price;
            orderItem.observation = observation || null;
            
            // Update total amount
            totalAmount += orderItem.quantity * orderItem.unitPrice;
            
            // Update product stock
            product.stock -= quantity;
            await queryRunner.manager.save(product);
            
            orderItems.push(orderItem);
          }
        }
        
        // Create order
        const order = new OrderEntity();
        if (customerId) {
          order.customerId = Number(customerId);
        }
        order.transactionId = transactionId;
        order.status = OrderStatus.PAYMENT_PENDING;
        order.totalAmount = totalAmount;
        
        // Save order
        const savedOrder = await queryRunner.manager.save(order);
        
        // Save order items with order ID if there are any
        if (orderItems.length > 0) {
          for (const item of orderItems) {
            item.orderId = savedOrder.id;
            await queryRunner.manager.save(item);
          }
        }

        await queryRunner.commitTransaction();

        // Return the complete order with items
        const completeOrder = await orderRepository.findOne({
          where: { id: savedOrder.id },
          relations: ['items', 'items.product', 'customer']
        });

        return res.status(201).json(completeOrder);
      } catch (error) {
        await queryRunner.rollbackTransaction();
        throw error;
      } finally {
        await queryRunner.release();
      }
    } catch (error) {
      console.error('Error creating order:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * @swagger
   * /orders/{id}/status:
   *   put:
   *     summary: Update order status
   *     tags: [Orders]
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: integer
   *         required: true
   *         description: The order id
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
   *                 enum: [PAYMENT_PENDING, PAID, IN_PREPARATION, READY_FOR_PICKUP, PICKED_UP, CANCELED]
   *                 description: The new status of the order
   *     responses:
   *       200:
   *         description: The updated order
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Order'
   *       400:
   *         description: Bad request - invalid status or status transition
   *       404:
   *         description: Order not found
   *       500:
   *         description: Internal server error
   */
  async updateOrderStatus(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      if (!status || !Object.values(OrderStatus).includes(status)) {
        return res.status(400).json({ error: 'Valid status is required' });
      }
      
      const dataSource = await getDataSource();
      const orderRepository = dataSource.getRepository(OrderEntity);
      
      const existingOrder = await orderRepository.findOne({
        where: { id: Number(id) }
      });
      
      if (!existingOrder) {
        return res.status(404).json({ error: 'Order not found' });
      }
      
      // Validate status transitions
      if (existingOrder.status === OrderStatus.CANCELED) {
        return res.status(400).json({ error: 'Cannot update status of a cancelled order' });
      }
      
      if (existingOrder.status === OrderStatus.PICKED_UP && status !== OrderStatus.CANCELED) {
        return res.status(400).json({ error: 'Completed order can only be cancelled' });
      }
      
      // Update status
      existingOrder.status = status;
      
      const updatedOrder = await orderRepository.save(existingOrder);
      return res.status(200).json(updatedOrder);
    } catch (error) {
      console.error('Error updating order status:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * @swagger
   * /orders/{id}/cancel:
   *   put:
   *     summary: Cancel an order
   *     tags: [Orders]
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: integer
   *         required: true
   *         description: The order id
   *     responses:
   *       200:
   *         description: Order cancelled successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: Order cancelled successfully
   *       400:
   *         description: Bad request - order is already cancelled
   *       404:
   *         description: Order not found
   *       500:
   *         description: Internal server error
   */
  async cancelOrder(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      
      const dataSource = await getDataSource();
      const orderRepository = dataSource.getRepository(OrderEntity);
      const productRepository = dataSource.getRepository(ProductEntity);
      
      // Start a transaction
      const queryRunner = dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();
      
      try {
        const existingOrder = await orderRepository.findOne({
          where: { id: Number(id) },
          relations: ['items']
        });
        
        if (!existingOrder) {
          return res.status(404).json({ error: 'Order not found' });
        }
        
        if (existingOrder.status === OrderStatus.CANCELED) {
          return res.status(400).json({ error: 'Order is already cancelled' });
        }
        
        // Update order status
        existingOrder.status = OrderStatus.CANCELED;
        await queryRunner.manager.save(existingOrder);
        
        // Restore product stock
        for (const item of existingOrder.items) {
          const product = await productRepository.findOne({
            where: { id: item.productId }
          });
          
          if (product) {
            product.stock += item.quantity;
            await queryRunner.manager.save(product);
          }
        }
        
        // Commit transaction
        await queryRunner.commitTransaction();
        
        return res.status(200).json({ message: 'Order cancelled successfully' });
      } catch (error) {
        // Rollback transaction in case of error
        await queryRunner.rollbackTransaction();
        throw error;
      } finally {
        // Release query runner
        await queryRunner.release();
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * @swagger
   * /orders/{id}/items:
   *   post:
   *     summary: Add an item to an order
   *     tags: [Orders]
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: integer
   *         required: true
   *         description: The order id
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
   *                 description: The ID of the product
   *               observation:
   *                 type: string
   *                 description: Optional observation for the item
   *     responses:
   *       201:
   *         description: The updated order with the new item
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Order'
   *       400:
   *         description: Bad request - missing required fields or validation error
   *       404:
   *         description: Order or product not found
   *       500:
   *         description: Internal server error
   */
  async addOrderItem(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const { productId, observation } = req.body;
      
      if (!productId) {
        return res.status(400).json({ error: 'Product ID is required' });
      }
      
      const dataSource = await getDataSource();
      const orderRepository = dataSource.getRepository(OrderEntity);
      const productRepository = dataSource.getRepository(ProductEntity);
      
      // Start a transaction
      const queryRunner = dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();
      
      try {
        // Validate order exists and is not cancelled or completed
        const order = await orderRepository.findOne({
          where: { id: Number(id) }
        });
        
        if (!order) {
          return res.status(404).json({ error: 'Order not found' });
        }
        
        if (order.status === OrderStatus.CANCELED || order.status === OrderStatus.PICKED_UP) {
          return res.status(400).json({ error: 'Cannot add items to a cancelled or completed order' });
        }
        
        // Validate product exists and has stock
        const product = await productRepository.findOne({
          where: { id: Number(productId) }
        });
        
        if (!product) {
          return res.status(404).json({ error: `Product with ID ${productId} not found` });
        }
        
        if (product.stock < 1) {
          return res.status(400).json({ error: `Not enough stock for product ${product.name}` });
        }
        
        // Create order item
        const orderItem = new OrderItemEntity();
        orderItem.orderId = order.id;
        orderItem.productId = Number(productId);
        orderItem.quantity = 1; // Default quantity is 1
        orderItem.unitPrice = product.price;
        orderItem.observation = observation || null;
        
        // Update product stock
        product.stock -= 1;
        await queryRunner.manager.save(product);
        
        // Update order total amount
        const currentTotal = Number(order.totalAmount) || 0;
        const itemPrice = Number(orderItem.unitPrice) || 0;
        order.totalAmount = Number((currentTotal + itemPrice).toFixed(2));
        await queryRunner.manager.save(order);
        
        // Save order item
        const savedOrderItem = await queryRunner.manager.save(orderItem);
        
        // Commit transaction
        await queryRunner.commitTransaction();
        
        // Return the complete order with items
        const completeOrder = await orderRepository.findOne({
          where: { id: order.id },
          relations: ['items', 'items.product', 'customer']
        });
        
        return res.status(201).json(completeOrder);
      } catch (error) {
        // Rollback transaction on error
        await queryRunner.rollbackTransaction();
        throw error;
      } finally {
        // Release query runner
        await queryRunner.release();
      }
    } catch (error) {
      console.error('Error adding item to order:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * @swagger
   * /orders/{id}/items:
   *   delete:
   *     summary: Remove an item from an order
   *     tags: [Orders]
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: integer
   *         required: true
   *         description: The order id
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
   *                 description: The ID of the order item to remove
   *     responses:
   *       200:
   *         description: The updated order after item removal
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Order'
   *       400:
   *         description: Bad request - missing required fields or validation error
   *       404:
   *         description: Order or order item not found
   *       500:
   *         description: Internal server error
   */
  async removeOrderItem(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const { itemId } = req.body;
      
      if (!itemId) {
        return res.status(400).json({ error: 'Item ID is required' });
      }
      
      const dataSource = await getDataSource();
      const orderRepository = dataSource.getRepository(OrderEntity);
      const orderItemRepository = dataSource.getRepository(OrderItemEntity);
      const productRepository = dataSource.getRepository(ProductEntity);
      
      // Start a transaction
      const queryRunner = dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();
      
      try {
        // Validate order exists and is not cancelled or completed
        const order = await orderRepository.findOne({
          where: { id: Number(id) }
        });
        
        if (!order) {
          return res.status(404).json({ error: 'Order not found' });
        }
        
        if (order.status === OrderStatus.CANCELED || order.status === OrderStatus.PICKED_UP) {
          return res.status(400).json({ error: 'Cannot remove items from a cancelled or completed order' });
        }
        
        // Find the order item
        const orderItem = await orderItemRepository.findOne({
          where: { 
            id: Number(itemId),
            orderId: order.id
          }
        });
        
        if (!orderItem) {
          return res.status(404).json({ error: 'Order item not found' });
        }
        
        // Find the product to restore stock
        const product = await productRepository.findOne({
          where: { id: orderItem.productId }
        });
        
        if (product) {
          // Restore product stock
          product.stock += orderItem.quantity;
          await queryRunner.manager.save(product);
        }
        
        // Update order total amount
        const currentTotal = Number(order.totalAmount) || 0;
        const itemTotal = Number(orderItem.unitPrice * orderItem.quantity) || 0;
        order.totalAmount = Number((currentTotal - itemTotal).toFixed(2));
        await queryRunner.manager.save(order);
        
        // Remove the order item
        await queryRunner.manager.remove(orderItem);
        
        // Commit transaction
        await queryRunner.commitTransaction();
        
        // Return the complete order with items
        const completeOrder = await orderRepository.findOne({
          where: { id: order.id },
          relations: ['items', 'items.product', 'customer']
        });
        
        return res.status(200).json(completeOrder);
      } catch (error) {
        // Rollback transaction on error
        await queryRunner.rollbackTransaction();
        throw error;
      } finally {
        // Release query runner
        await queryRunner.release();
      }
    } catch (error) {
      console.error('Error removing item from order:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * @swagger
   * /orders/{id}/finalize:
   *   put:
   *     summary: Finalize an order
   *     tags: [Orders]
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: integer
   *         required: true
   *         description: The order id
   *     responses:
   *       200:
   *         description: The finalized order
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Order'
   *       400:
   *         description: Bad request - order cannot be finalized
   *       404:
   *         description: Order not found
   *       500:
   *         description: Internal server error
   */
  async finalizeOrder(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      
      const dataSource = await getDataSource();
      const orderRepository = dataSource.getRepository(OrderEntity);
      
      const existingOrder = await orderRepository.findOne({
        where: { id: Number(id) }
      });
      
      if (!existingOrder) {
        return res.status(404).json({ error: 'Order not found' });
      }
      
      // Validate if the order can be finalized
      if (existingOrder.status === OrderStatus.CANCELED) {
        return res.status(400).json({ error: 'Cannot finalize a cancelled order' });
      }
      
      if (existingOrder.status === OrderStatus.COMPLETED) {
        return res.status(400).json({ error: 'Order is already finalized' });
      }
      
      // Update status to payment pending
      existingOrder.status = OrderStatus.COMPLETED;
      
      const updatedOrder = await orderRepository.save(existingOrder);
      return res.status(200).json(updatedOrder);
    } catch (error) {
      console.error('Error finalizing order:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * @swagger
   * /orders/ready:
   *   get:
   *     summary: Returns all orders ready for pickup
   *     tags: [Orders]
   *     responses:
   *       200:
   *         description: The list of orders ready for pickup
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 allOf:
   *                   - $ref: '#/components/schemas/Order'
   *                   - type: object
   *                     properties:
   *                       prepTime:
   *                         type: string
   *                         description: Time since the order was marked as ready (HH:mm format)
   *       500:
   *         description: Internal server error
   */
  async getReadyOrders(req: Request, res: Response): Promise<Response> {
    try {
      const dataSource = await getDataSource();
      const orderRepository = dataSource.getRepository(OrderEntity);
      const orders = await orderRepository.find({
        where: { status: OrderStatus.READY_FOR_PICKUP },
        relations: ['items', 'items.product', 'customer']
      });

      // Add preparation time for each order
      const ordersWithPrepTime = orders.map(order => {
        const now = new Date();
        const updatedAt = new Date(order.updatedAt);
        const diffInMinutes = Math.floor((now.getTime() - updatedAt.getTime()) / (1000 * 60));
        
        // Format time in HH:mm
        const hours = Math.floor(diffInMinutes / 60);
        const minutes = diffInMinutes % 60;
        const prepTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        
        return {
          ...order,
          prepTime
        };
      });

      return res.status(200).json(ordersWithPrepTime);
    } catch (error) {
      console.error('Error fetching ready orders:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * @swagger
   * /orders/{id}/prepare:
   *   put:
   *     summary: Start preparing an order
   *     tags: [Orders]
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: integer
   *         required: true
   *         description: The order id
   *     responses:
   *       200:
   *         description: The order with updated status
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Order'
   *       400:
   *         description: Bad request - order cannot be prepared
   *       404:
   *         description: Order not found
   *       500:
   *         description: Internal server error
   */
  async startPreparingOrder(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      
      const dataSource = await getDataSource();
      const orderRepository = dataSource.getRepository(OrderEntity);
      
      const existingOrder = await orderRepository.findOne({
        where: { id: Number(id) }
      });
      
      if (!existingOrder) {
        return res.status(404).json({ error: 'Order not found' });
      }
      
      // Validate if the order can start being prepared
      if (existingOrder.status === OrderStatus.CANCELED) {
        return res.status(400).json({ error: 'Cannot prepare a cancelled order' });
      }
      
      if (existingOrder.status === OrderStatus.PICKED_UP) {
        return res.status(400).json({ error: 'Cannot prepare an already finalized order' });
      }
      
      if (existingOrder.status === OrderStatus.READY_FOR_PICKUP) {
        return res.status(400).json({ error: 'Order is already ready' });
      }
      
      if (existingOrder.status === OrderStatus.IN_PREPARATION) {
        return res.status(400).json({ error: 'Order is already being prepared' });
      }
      
      // Update status to preparing
      existingOrder.status = OrderStatus.IN_PREPARATION;
      
      const updatedOrder = await orderRepository.save(existingOrder);
      return res.status(200).json(updatedOrder);
    } catch (error) {
      console.error('Error starting order preparation:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * @swagger
   * /orders/{id}/complete:
   *   put:
   *     summary: Mark an order as ready for pickup
   *     tags: [Orders]
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: integer
   *         required: true
   *         description: The order id
   *     responses:
   *       200:
   *         description: The order with updated status
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Order'
   *       400:
   *         description: Bad request - order cannot be completed
   *       404:
   *         description: Order not found
   *       500:
   *         description: Internal server error
   */
  async completeOrder(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      
      const dataSource = await getDataSource();
      const orderRepository = dataSource.getRepository(OrderEntity);
      
      const existingOrder = await orderRepository.findOne({
        where: { id: Number(id) }
      });
      
      if (!existingOrder) {
        return res.status(404).json({ error: 'Order not found' });
      }
      
      // Validate if the order can be completed
      if (existingOrder.status === OrderStatus.CANCELED) {
        return res.status(400).json({ error: 'Cannot complete a cancelled order' });
      }
      
      if (existingOrder.status === OrderStatus.PICKED_UP) {
        return res.status(400).json({ error: 'Order is already completed' });
      }
      
      if (existingOrder.status === OrderStatus.PAYMENT_PENDING) {
        return res.status(400).json({ error: 'Order has not been started yet' });
      }
      
      // Update status to ready for pickup
      existingOrder.status = OrderStatus.READY_FOR_PICKUP;
      
      const updatedOrder = await orderRepository.save(existingOrder);
      return res.status(200).json(updatedOrder);
    } catch (error) {
      console.error('Error completing order:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * @swagger
   * /orders/{id}/confirm-pickup:
   *   put:
   *     summary: Confirm order pickup
   *     tags: [Orders]
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: integer
   *         required: true
   *         description: The order id
   *     responses:
   *       200:
   *         description: The order with updated status
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Order'
   *       400:
   *         description: Bad request - order cannot be picked up
   *       404:
   *         description: Order not found
   *       500:
   *         description: Internal server error
   */
  async confirmOrderPickup(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      
      const dataSource = await getDataSource();
      const orderRepository = dataSource.getRepository(OrderEntity);
      
      const existingOrder = await orderRepository.findOne({
        where: { id: Number(id) }
      });
      
      if (!existingOrder) {
        return res.status(404).json({ error: 'Order not found' });
      }
      
      // Validate if the order can be delivered
      if (existingOrder.status === OrderStatus.CANCELED) {
        return res.status(400).json({ error: 'Cannot deliver a cancelled order' });
      }
      
      if (existingOrder.status === OrderStatus.PICKED_UP) {
        return res.status(400).json({ error: 'Order is already delivered' });
      }
      
      if (existingOrder.status !== OrderStatus.READY_FOR_PICKUP) {
        return res.status(400).json({ error: 'Order preparation must be completed before delivery' });
      }
      
      // Update status to picked up
      existingOrder.status = OrderStatus.PICKED_UP;
      
      const updatedOrder = await orderRepository.save(existingOrder);
      return res.status(200).json(updatedOrder);
    } catch (error) {
      console.error('Error confirming order delivery:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}
