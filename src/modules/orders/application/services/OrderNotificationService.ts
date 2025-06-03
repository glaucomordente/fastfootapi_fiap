import { Order } from "../../domain/entities/Order";
import { OrderRepository } from "../../domain/repositories/OrderRepository";

export class OrderNotificationService {
  constructor(private orderRepository: OrderRepository) {}

  async notifyOrderReady(orderId: string): Promise<void> {
    const order = await this.orderRepository.findById(orderId);

    if (!order) {
      throw new Error("Order not found");
    }

    // Here you can implement the notification logic
    // For example, send an email, SMS, or push notification
    console.log(
      `Notifying customer ${order.customerId} that order ${orderId} is ready`
    );

    // Update order status
    order.status = "COMPLETED";
    await this.orderRepository.save(order);
  }
}
