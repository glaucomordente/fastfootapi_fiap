import { Request, Response } from 'express';
import { getDataSource } from '../lib/typeorm';
import { OrderEntity } from '../modules/orders/adapters/out/persistence/entities/Order.entity';
import { OrderItemEntity } from '../modules/orders/adapters/out/persistence/entities/OrderItem.entity';
import { ProductEntity } from '../modules/products/adapters/out/persistence/entities/Product.entity';
import { OrderStatus } from '../modules/orders/domain/entities/Order';
import { CustomerEntity } from '../modules/customer/adapters/out/persistence/entities/Customer.entity';

export const getAllOrders = async (req: Request, res: Response) => {
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
};

export const getOrderById = async (req: Request, res: Response) => {
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
};

export const createOrder = async (req: Request, res: Response) => {
  try {
    const { customerId, items = [] } = req.body;
    
    if (!customerId) {
      return res.status(400).json({ error: 'Customer ID is required' });
    }
    
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
      // Validate customer exists
      const customer = await customerRepository.findOne({
        where: { id: Number(customerId) }
      });
      
      if (!customer) {
        return res.status(404).json({ error: `Customer with ID ${customerId} not found` });
      }

      // Validate products and calculate total amount
      let totalAmount = 0;
      const orderItems: OrderItemEntity[] = [];
      
      if (Array.isArray(items) && items.length > 0) {
        for (const item of items) {
          const { productId, quantity } = item;
          
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
      order.customerId = Number(customerId);
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
      
      // Commit transaction
      await queryRunner.commitTransaction();
      
      // Return the complete order with items
      const completeOrder = await orderRepository.findOne({
        where: { id: savedOrder.id },
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
    console.error('Error creating order:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
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
    if (existingOrder.status === OrderStatus.CANCELLED) {
      return res.status(400).json({ error: 'Cannot update status of a cancelled order' });
    }
    
    if (existingOrder.status === OrderStatus.COMPLETED && status !== OrderStatus.CANCELLED) {
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
};

export const cancelOrder = async (req: Request, res: Response) => {
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
      
      if (existingOrder.status === OrderStatus.CANCELLED) {
        return res.status(400).json({ error: 'Order is already cancelled' });
      }
      
      // Update order status
      existingOrder.status = OrderStatus.CANCELLED;
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
};

export const addOrderItem = async (req: Request, res: Response) => {
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
      
      if (order.status === OrderStatus.CANCELLED || order.status === OrderStatus.COMPLETED) {
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
};

export const removeOrderItem = async (req: Request, res: Response) => {
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
      
      if (order.status === OrderStatus.CANCELLED || order.status === OrderStatus.COMPLETED) {
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
};

export const finalizeOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const dataSource = await getDataSource();
    const orderRepository = dataSource.getRepository(OrderEntity);
    
    const existingOrder = await orderRepository.findOne({
      where: { id: Number(id) }
    });
    
    if (!existingOrder) {
      return res.status(404).json({ error: 'Pedido não encontrado' });
    }
    
    // Validar se o pedido pode ser finalizado
    if (existingOrder.status === OrderStatus.CANCELLED) {
      return res.status(400).json({ error: 'Não é possível finalizar um pedido cancelado' });
    }
    
    if (existingOrder.status === OrderStatus.COMPLETED) {
      return res.status(400).json({ error: 'Pedido já está finalizado' });
    }
    
    // Atualizar status para pagamento
    existingOrder.status = OrderStatus.PAYMENT;
    
    const updatedOrder = await orderRepository.save(existingOrder);
    return res.status(200).json(updatedOrder);
  } catch (error) {
    console.error('Erro ao finalizar pedido:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const getReadyOrders = async (req: Request, res: Response) => {
  try {
    const dataSource = await getDataSource();
    const orderRepository = dataSource.getRepository(OrderEntity);
    const orders = await orderRepository.find({
      where: { status: OrderStatus.READY },
      relations: ['items', 'items.product', 'customer']
    });
    return res.status(200).json(orders);
  } catch (error) {
    console.error('Erro ao buscar pedidos prontos:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const startPreparingOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const dataSource = await getDataSource();
    const orderRepository = dataSource.getRepository(OrderEntity);
    
    const existingOrder = await orderRepository.findOne({
      where: { id: Number(id) }
    });
    
    if (!existingOrder) {
      return res.status(404).json({ error: 'Pedido não encontrado' });
    }
    
    // Validar se o pedido pode começar a ser preparado
    if (existingOrder.status === OrderStatus.CANCELLED) {
      return res.status(400).json({ error: 'Não é possível preparar um pedido cancelado' });
    }
    
    if (existingOrder.status === OrderStatus.COMPLETED) {
      return res.status(400).json({ error: 'Não é possível preparar um pedido já finalizado' });
    }
    
    if (existingOrder.status === OrderStatus.READY) {
      return res.status(400).json({ error: 'Pedido já está pronto' });
    }
    
    if (existingOrder.status === OrderStatus.PREPARING) {
      return res.status(400).json({ error: 'Pedido já está em preparo' });
    }
    
    // Atualizar status para preparando
    existingOrder.status = OrderStatus.PREPARING;
    
    const updatedOrder = await orderRepository.save(existingOrder);
    return res.status(200).json(updatedOrder);
  } catch (error) {
    console.error('Erro ao iniciar preparo do pedido:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const completeOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const dataSource = await getDataSource();
    const orderRepository = dataSource.getRepository(OrderEntity);
    
    const existingOrder = await orderRepository.findOne({
      where: { id: Number(id) }
    });
    
    if (!existingOrder) {
      return res.status(404).json({ error: 'Pedido não encontrado' });
    }
    
    // Validar se o pedido pode ser finalizado
    if (existingOrder.status === OrderStatus.CANCELLED) {
      return res.status(400).json({ error: 'Não é possível finalizar um pedido cancelado' });
    }
    
    if (existingOrder.status === OrderStatus.COMPLETED) {
      return res.status(400).json({ error: 'Pedido já está finalizado' });
    }
    
    if (existingOrder.status === OrderStatus.PENDING) {
      return res.status(400).json({ error: 'Pedido ainda não foi iniciado' });
    }
    
    // Atualizar status para finalizado
    existingOrder.status = OrderStatus.COMPLETED;
    
    const updatedOrder = await orderRepository.save(existingOrder);
    return res.status(200).json(updatedOrder);
  } catch (error) {
    console.error('Erro ao finalizar pedido:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const confirmOrderPickup = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const dataSource = await getDataSource();
    const orderRepository = dataSource.getRepository(OrderEntity);
    
    const existingOrder = await orderRepository.findOne({
      where: { id: Number(id) }
    });
    
    if (!existingOrder) {
      return res.status(404).json({ error: 'Pedido não encontrado' });
    }
    
    // Validar se o pedido pode ser entregue
    if (existingOrder.status === OrderStatus.CANCELLED) {
      return res.status(400).json({ error: 'Não é possível entregar um pedido cancelado' });
    }
    
    if (existingOrder.status === OrderStatus.DELIVERED) {
      return res.status(400).json({ error: 'Pedido já está entregue' });
    }
    
    if (existingOrder.status !== OrderStatus.COMPLETED) {
      return res.status(400).json({ error: 'O preparo do pedido precisa estar finalizado para ser entregue' });
    }
    
    // Atualizar status para entregue
    existingOrder.status = OrderStatus.DELIVERED;
    
    const updatedOrder = await orderRepository.save(existingOrder);
    return res.status(200).json(updatedOrder);
  } catch (error) {
    console.error('Erro ao confirmar entrega do pedido:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
};
