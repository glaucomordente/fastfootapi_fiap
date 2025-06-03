import { OrderNotificationController } from './adapters/in/web/OrderNotificationController';
import { OrderNotificationService } from './application/services/OrderNotificationService';
import { TypeORMOrderRepository } from './adapters/out/persistence/TypeORMOrderRepository';
import { getDataSource } from '../../lib/typeorm';
import { OrderController } from './adapters/in/web/OrderController';

export class OrderModule {
  private orderNotificationController: OrderNotificationController;
  private orderController: OrderController;
  private initialized: boolean = false;

  constructor() {
    // Initialize controllers
    this.orderController = new OrderController();
    this.initialize();
  }

  private async initialize() {
    if (!this.initialized) {
      const dataSource = await getDataSource();
      const orderRepository = new TypeORMOrderRepository(dataSource);
      const orderNotificationService = new OrderNotificationService(orderRepository);
      this.orderNotificationController = new OrderNotificationController(orderNotificationService);
      this.initialized = true;
    }
  }

  async getOrderNotificationController(): Promise<OrderNotificationController> {
    if (!this.initialized) {
      await this.initialize();
    }
    return this.orderNotificationController;
  }

  /**
   * Get the order controller
   * @returns The order controller instance
   */
  getController(): OrderController {
    return this.orderController;
  }
}
