import { Request, Response } from "express";
import { getDataSource } from "../../../../../lib/typeorm";
import { OrderEntity } from "../../out/persistence/entities/Order.entity";
import { OrderItemEntity } from "../../out/persistence/entities/OrderItem.entity";
import { ProductEntity } from "../../../../../modules/products/adapters/out/persistence/entities/Product.entity";
import { CustomerEntity } from "../../../../../modules/customer/adapters/out/persistence/entities/Customer.entity";
import { OrderStatus } from "../../../../../modules/orders/domain/entities/Order";
import { Repository } from "typeorm";

/**
 * OrderController
 *
 * This controller serves as an input adapter for the web interface.
 * It translates HTTP requests into calls to the OrderUseCase (input port).
 */
export class OrderController {
  private orderRepository: Repository<OrderEntity>;

  constructor() {
    getDataSource().then((dataSource) => {
      this.orderRepository = dataSource.getRepository(OrderEntity);
    });
  }

  /**
   * Get all orders
   */
  getAllOrders = async (req: Request, res: Response) => {
    try {
      const dataSource = await getDataSource();
      const orderRepository = dataSource.getRepository(OrderEntity);
      const orders = await orderRepository.find({
        relations: ["items", "items.product", "customer"],
      });
      res.status(200).json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };

  /**
   * Get an order by ID
   */
  getOrderById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const dataSource = await getDataSource();
      const orderRepository = dataSource.getRepository(OrderEntity);
      const order = await orderRepository.findOne({
        where: { id: Number(id) },
        relations: ["items", "items.product", "customer"],
      });

      if (!order) {
        res.status(404).json({ error: "Order not found" });
        return;
      }

      res.status(200).json(order);
    } catch (error) {
      console.error("Error fetching order:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };

  /**
   * Create a new order
   */
  createOrder = async (req: Request, res: Response) => {
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
            where: { id: Number(customerId) },
          });

          if (!customer) {
            res
              .status(404)
              .json({ error: `Customer with ID ${customerId} not found` });
            return;
          }
        }

        // Generate unique transactionId
        const lastOrder = await orderRepository.findOne({
          order: { transactionId: "DESC" },
          where: {},
        });
        const transactionId = lastOrder ? lastOrder.transactionId + 1 : 1;

        // Validate products and calculate total amount
        let totalAmount = 0;
        const orderItems: OrderItemEntity[] = [];

        if (Array.isArray(items) && items.length > 0) {
          for (const item of items) {
            const { productId, quantity, observation } = item;

            if (!productId || !quantity || quantity <= 0) {
              res.status(400).json({
                error: "Each item must have a valid productId and quantity",
              });
              return;
            }

            // Check if product exists and has enough stock
            const product = await productRepository.findOne({
              where: { id: Number(productId) },
            });

            if (!product) {
              res
                .status(404)
                .json({ error: `Product with ID ${productId} not found` });
              return;
            }

            if (product.stock < quantity) {
              res.status(400).json({
                error: `Not enough stock for product ${product.name}`,
              });
              return;
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
        order.status = OrderStatus.PENDING;
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
          relations: ["items", "items.product", "customer"],
        });

        res.status(201).json(completeOrder);
      } catch (error) {
        await queryRunner.rollbackTransaction();
        throw error;
      } finally {
        await queryRunner.release();
      }
    } catch (error) {
      console.error("Error creating order:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };

  /**
   * Update order status
   */
  updateOrderStatus = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status || !Object.values(OrderStatus).includes(status)) {
        res.status(400).json({ error: "Valid status is required" });
        return;
      }

      const dataSource = await getDataSource();
      const orderRepository = dataSource.getRepository(OrderEntity);

      const existingOrder = await orderRepository.findOne({
        where: { id: Number(id) },
      });

      if (!existingOrder) {
        res.status(404).json({ error: "Order not found" });
        return;
      }

      // Validate status transitions
      if (existingOrder.status === OrderStatus.CANCELLED) {
        res
          .status(400)
          .json({ error: "Cannot update status of a cancelled order" });
        return;
      }

      if (
        existingOrder.status === OrderStatus.COMPLETED &&
        status !== OrderStatus.CANCELLED
      ) {
        res
          .status(400)
          .json({ error: "Completed order can only be cancelled" });
        return;
      }

      // Update status
      existingOrder.status = status;

      const updatedOrder = await orderRepository.save(existingOrder);
      res.status(200).json(updatedOrder);
    } catch (error) {
      console.error("Error updating order status:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };

  /**
   * Cancel an order
   */
  cancelOrder = async (req: Request, res: Response) => {
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
          relations: ["items"],
        });

        if (!existingOrder) {
          res.status(404).json({ error: "Order not found" });
          return;
        }

        if (existingOrder.status === OrderStatus.CANCELLED) {
          res.status(400).json({ error: "Order is already cancelled" });
          return;
        }

        // Update order status
        existingOrder.status = OrderStatus.CANCELLED;
        await queryRunner.manager.save(existingOrder);

        // Restore product stock
        for (const item of existingOrder.items) {
          const product = await productRepository.findOne({
            where: { id: item.productId },
          });

          if (product) {
            product.stock += item.quantity;
            await queryRunner.manager.save(product);
          }
        }

        // Commit transaction
        await queryRunner.commitTransaction();

        res.status(200).json({ message: "Order cancelled successfully" });
      } catch (error) {
        // Rollback transaction in case of error
        await queryRunner.rollbackTransaction();
        throw error;
      } finally {
        // Release query runner
        await queryRunner.release();
      }
    } catch (error) {
      console.error("Error cancelling order:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };

  /**
   * Add an item to the order
   */
  addOrderItem = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { productId, observation } = req.body;

      if (!productId) {
        res.status(400).json({ error: "Product ID is required" });
        return;
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
          where: { id: Number(id) },
        });

        if (!order) {
          res.status(404).json({ error: "Order not found" });
          return;
        }

        if (
          order.status === OrderStatus.CANCELLED ||
          order.status === OrderStatus.COMPLETED
        ) {
          res.status(400).json({
            error: "Cannot add items to a cancelled or completed order",
          });
          return;
        }

        // Validate product exists and has stock
        const product = await productRepository.findOne({
          where: { id: Number(productId) },
        });

        if (!product) {
          res
            .status(404)
            .json({ error: `Product with ID ${productId} not found` });
          return;
        }

        if (product.stock < 1) {
          res
            .status(400)
            .json({ error: `Not enough stock for product ${product.name}` });
          return;
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
          relations: ["items", "items.product", "customer"],
        });

        res.status(201).json(completeOrder);
      } catch (error) {
        // Rollback transaction on error
        await queryRunner.rollbackTransaction();
        throw error;
      } finally {
        // Release query runner
        await queryRunner.release();
      }
    } catch (error) {
      console.error("Error adding item to order:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };

  /**
   * Remove an item from the order
   */
  removeOrderItem = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { itemId } = req.body;

      if (!itemId) {
        res.status(400).json({ error: "Item ID is required" });
        return;
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
          where: { id: Number(id) },
        });

        if (!order) {
          res.status(404).json({ error: "Order not found" });
          return;
        }

        if (
          order.status === OrderStatus.CANCELLED ||
          order.status === OrderStatus.COMPLETED
        ) {
          res.status(400).json({
            error: "Cannot remove items from a cancelled or completed order",
          });
          return;
        }

        // Find the order item
        const orderItem = await orderItemRepository.findOne({
          where: {
            id: Number(itemId),
            orderId: order.id,
          },
        });

        if (!orderItem) {
          res.status(404).json({ error: "Order item not found" });
          return;
        }

        // Find the product to restore stock
        const product = await productRepository.findOne({
          where: { id: orderItem.productId },
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
          relations: ["items", "items.product", "customer"],
        });

        res.status(200).json(completeOrder);
      } catch (error) {
        // Rollback transaction on error
        await queryRunner.rollbackTransaction();
        throw error;
      } finally {
        // Release query runner
        await queryRunner.release();
      }
    } catch (error) {
      console.error("Error removing item from order:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };

  /**
   * Finalize an order
   */
  finalizeOrder = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const dataSource = await getDataSource();
      const orderRepository = dataSource.getRepository(OrderEntity);

      const existingOrder = await orderRepository.findOne({
        where: { id: Number(id) },
      });

      if (!existingOrder) {
        res.status(404).json({ error: "Order not found" });
        return;
      }

      // Validate if order can be finalized
      if (existingOrder.status === OrderStatus.CANCELLED) {
        res.status(400).json({ error: "Cannot finalize a cancelled order" });
        return;
      }

      if (existingOrder.status === OrderStatus.COMPLETED) {
        res.status(400).json({ error: "Order is already finalized" });
        return;
      }

      // Update status to payment
      existingOrder.status = OrderStatus.PAYMENT;

      const updatedOrder = await orderRepository.save(existingOrder);
      res.status(200).json(updatedOrder);
    } catch (error) {
      console.error("Error finalizing order:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };

  /**
   * Get all ready orders
   */
  getReadyOrders = async (req: Request, res: Response) => {
    try {
      const dataSource = await getDataSource();
      const orderRepository = dataSource.getRepository(OrderEntity);

      const orders = await orderRepository.find({
        where: { status: OrderStatus.READY },
        relations: ["items", "items.product", "customer"],
        order: {
          updatedAt: "DESC",
        },
      });

      // Add preparation time for each order
      const ordersWithPrepTime = orders.map((order) => {
        const now = new Date();
        const updatedAt = new Date(order.updatedAt);
        const diffInMinutes = Math.floor(
          (now.getTime() - updatedAt.getTime()) / (1000 * 60)
        );

        // Format time as HH:mm
        const hours = Math.floor(diffInMinutes / 60);
        const minutes = diffInMinutes % 60;
        const prepTime = `${hours.toString().padStart(2, "0")}:${minutes
          .toString()
          .padStart(2, "0")}`;

        return {
          ...order,
          prepTime,
        };
      });

      res.status(200).json(ordersWithPrepTime);
    } catch (error) {
      console.error("Error fetching ready orders:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };

  /**
   * Start preparing an order
   */
  startPreparingOrder = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const order = await this.orderRepository.findOne({
        where: { id: Number(id) },
        relations: ["items", "items.product"],
      });

      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      if (order.status === OrderStatus.CANCELLED) {
        return res.status(400).json({
          message: "Cannot start preparing a cancelled order",
        });
      }

      if (order.status === OrderStatus.DELIVERED) {
        return res.status(400).json({
          message: "Cannot start preparing a delivered order",
        });
      }

      if (order.status !== OrderStatus.COMPLETED) {
        return res.status(400).json({
          message: "Order must be in COMPLETED status to start preparation",
        });
      }

      order.status = OrderStatus.PREPARING;
      await this.orderRepository.save(order);

      return res.json(order);
    } catch (error) {
      console.error("Error starting order preparation:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  };

  /**
   * Complete an order
   */
  completeOrder = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const dataSource = await getDataSource();
      const orderRepository = dataSource.getRepository(OrderEntity);

      const existingOrder = await orderRepository.findOne({
        where: { id: Number(id) },
      });

      if (!existingOrder) {
        res.status(404).json({ error: "Order not found" });
        return;
      }

      // Validate if order can be completed
      if (existingOrder.status === OrderStatus.CANCELLED) {
        res.status(400).json({ error: "Cannot complete a cancelled order" });
        return;
      }

      if (existingOrder.status === OrderStatus.COMPLETED) {
        res.status(400).json({ error: "Order is already completed" });
        return;
      }

      if (existingOrder.status === OrderStatus.PENDING) {
        res.status(400).json({ error: "Order has not been started yet" });
        return;
      }

      // Update status to completed
      existingOrder.status = OrderStatus.COMPLETED;

      const updatedOrder = await orderRepository.save(existingOrder);
      res.status(200).json(updatedOrder);
    } catch (error) {
      console.error("Error completing order:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };

  /**
   * Mark order as ready for pickup
   */
  markOrderReadyForPickup = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const dataSource = await getDataSource();
      const orderRepository = dataSource.getRepository(OrderEntity);

      const existingOrder = await orderRepository.findOne({
        where: { id: Number(id) },
      });

      if (!existingOrder) {
        res.status(404).json({ error: "Order not found" });
        return;
      }

      // Validate if order can be marked as ready for pickup
      if (existingOrder.status === OrderStatus.CANCELLED) {
        res
          .status(400)
          .json({ error: "Cannot mark a cancelled order as ready for pickup" });
        return;
      }

      if (existingOrder.status === OrderStatus.DELIVERED) {
        res.status(400).json({ error: "Order is already delivered" });
        return;
      }

      if (existingOrder.status !== OrderStatus.PREPARING) {
        res.status(400).json({
          error:
            "Order must be in PREPARING status to be marked as ready for pickup",
        });
        return;
      }

      // Update status to ready for pickup
      existingOrder.status = OrderStatus.READY_TO_PICKUP;

      const updatedOrder = await orderRepository.save(existingOrder);
      res.status(200).json(updatedOrder);
    } catch (error) {
      console.error("Error marking order as ready for pickup:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };

  /**
   * Confirm order pickup
   */
  confirmOrderPickup = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const dataSource = await getDataSource();
      const orderRepository = dataSource.getRepository(OrderEntity);

      const existingOrder = await orderRepository.findOne({
        where: { id: Number(id) },
      });

      if (!existingOrder) {
        res.status(404).json({ error: "Order not found" });
        return;
      }

      // Validate if order can be delivered
      if (existingOrder.status === OrderStatus.CANCELLED) {
        res.status(400).json({ error: "Cannot deliver a cancelled order" });
        return;
      }

      if (existingOrder.status === OrderStatus.DELIVERED) {
        res.status(400).json({ error: "Order is already delivered" });
        return;
      }

      if (existingOrder.status !== OrderStatus.READY_TO_PICKUP) {
        res.status(400).json({
          error: "Order must be ready for pickup before delivery",
        });
        return;
      }

      // Update status to delivered
      existingOrder.status = OrderStatus.DELIVERED;

      const updatedOrder = await orderRepository.save(existingOrder);
      res.status(200).json(updatedOrder);
    } catch (error) {
      console.error("Error confirming order pickup:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };

  /**
   * Get all orders that are ready for pickup
   */
  getReadyToPickupOrders = async (req: Request, res: Response) => {
    try {
      const dataSource = await getDataSource();
      const orderRepository = dataSource.getRepository(OrderEntity);

      const orders = await orderRepository.find({
        where: { status: OrderStatus.READY_TO_PICKUP },
        relations: ["items", "items.product", "customer"],
        order: {
          updatedAt: "DESC",
        },
      });

      // Add waiting time for each order
      const ordersWithWaitingTime = orders.map((order) => {
        const now = new Date();
        const updatedAt = new Date(order.updatedAt);
        const diffInMinutes = Math.floor(
          (now.getTime() - updatedAt.getTime()) / (1000 * 60)
        );

        // Format time as HH:mm
        const hours = Math.floor(diffInMinutes / 60);
        const minutes = diffInMinutes % 60;
        const waitingTime = `${hours.toString().padStart(2, "0")}:${minutes
          .toString()
          .padStart(2, "0")}`;

        return {
          ...order,
          waitingTime,
        };
      });

      res.status(200).json(ordersWithWaitingTime);
    } catch (error) {
      console.error("Error fetching ready to pickup orders:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };
}
