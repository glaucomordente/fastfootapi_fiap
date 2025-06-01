import { Request, Response } from "express";
import { OrderNotificationService } from "../../../application/services/OrderNotificationService";

export class OrderNotificationController {
  constructor(private orderNotificationService: OrderNotificationService) {}

  async notifyOrderReady(req: Request, res: Response): Promise<void> {
    try {
      const { orderId } = req.params;
      
      await this.orderNotificationService.notifyOrderReady(orderId);
      
      res.status(200).json({
        message: "Customer successfully notified",
        orderId
      });
    } catch (error) {
      res.status(400).json({
        message: error instanceof Error ? error.message : "Error notifying customer"
      });
    }
  }
} 