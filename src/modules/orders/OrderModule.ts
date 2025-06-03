import { OrderController } from "./adapters/in/web/OrderController";
import { PaymentController } from "./adapters/in/web/PaymentController";

/**
 * OrderModule
 *
 * This module serves as the main entry point for the orders domain.
 * It initializes and manages all the components needed for order management.
 */
export class OrderModule {
  private orderController: OrderController;
  private paymentController: PaymentController;

  constructor() {
    // Initialize the controllers (input adapters)
    this.orderController = new OrderController();
    this.paymentController = new PaymentController();
  }

  /**
   * Get the order controller instance
   */
  getController(): OrderController {
    return this.orderController;
  }

  /**
   * Get the payment controller instance
   */
  getPaymentController(): PaymentController {
    return this.paymentController;
  }
}
