import { Request, Response } from "express";
import { OrderNotificationService } from "../../../application/services/OrderNotificationService";

/**
 * @swagger
 * components:
 *   schemas:
 *     OrderNotification:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Notification message
 *         orderId:
 *           type: string
 *           description: The ID of the order
 *       example:
 *         message: Customer successfully notified
 *         orderId: "1"
 */

export class OrderNotificationController {
  constructor(private orderNotificationService: OrderNotificationService) {}

  /**
   * @swagger
   * /orders/{orderId}/notify-ready:
   *   post:
   *     summary: Notify customer that their order is ready for pickup
   *     tags: [Orders]
   *     parameters:
   *       - in: path
   *         name: orderId
   *         schema:
   *           type: string
   *         required: true
   *         description: The order id
   *     responses:
   *       200:
   *         description: Customer successfully notified
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/OrderNotification'
   *       400:
   *         description: Error notifying customer
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   */
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
