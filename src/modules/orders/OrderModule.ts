import { DataSource } from 'typeorm';
import { OrderService } from './application/services/OrderService';
import { OrderUseCase } from './domain/ports/in/OrderUseCase';
// import { TypeORMOrderRepository } from './adapters/out/persistence/TypeORMOrderRepository'; // Need repository
// import { OrderEntity } from './adapters/out/persistence/entities/Order.entity'; // Need entity for repo
// import { OrderController } from './adapters/in/web/OrderController'; // Need controller

export class OrderModule {
  private orderService: OrderService;
  // private orderController: OrderController; // Uncomment when controller exists

  constructor(dataSource: DataSource) {
    // Initialize dependencies
    // const orderOrmRepository = dataSource.getRepository(OrderEntity); // Uncomment when entity exists
    // const orderRepository = new TypeORMOrderRepository(orderOrmRepository); // Uncomment when repo exists

    // Instantiate service (using placeholder dependencies for now)
    this.orderService = new OrderService(/* orderRepository */); // Pass repo when available

    // Instantiate controller (placeholder)
    // this.orderController = new OrderController(this.orderService); // Uncomment when controller exists
  }

  // Method to expose the use case (service)
  getUseCase(): OrderUseCase {
    return this.orderService;
  }

  // Method to expose the controller (placeholder)
  // getController(): OrderController {
  //   return this.orderController;
  // }
}

