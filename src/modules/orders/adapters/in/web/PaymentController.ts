import { Request, Response } from "express";
import { getDataSource } from "../../../../../lib/typeorm";
import { OrderEntity } from "../../out/persistence/entities/Order.entity";
import { OrderStatus } from "../../../../../modules/orders/domain/entities/Order";

/**
 * PaymentController
 *
 * This controller handles payment-related operations.
 * Currently implements a simple fake checkout that changes order status to COMPLETED.
 */
export class PaymentController {
  /**
   * Confirm payment and update order status
   */
  confirmPayment = async (req: Request, res: Response) => {
    try {
      const { orderId } = req.body;

      const dataSource = await getDataSource();
      const orderRepository = dataSource.getRepository(OrderEntity);

      const order = await orderRepository.findOne({
        where: { id: Number(orderId) },
      });

      if (!order) {
        res.status(404).json({ error: "Order not found" });
        return;
      }

      if (order.status !== OrderStatus.PAYMENT) {
        res.status(400).json({
          error: "Order must be in PAYMENT status to confirm payment",
        });
        return;
      }

      // Update order status to COMPLETED
      order.status = OrderStatus.COMPLETED;
      await orderRepository.save(order);

      res.status(200).json({
        message: "Payment confirmed successfully",
        order,
      });
    } catch (error) {
      console.error("Error confirming payment:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };
}
