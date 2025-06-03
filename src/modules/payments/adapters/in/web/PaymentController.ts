import { Request, Response } from 'express';
import { getDataSource } from '../../../../../lib/typeorm';
import { OrderEntity } from '../../../../orders/adapters/out/persistence/entities/Order.entity';
import { Payment } from '../../../../../database/entities/Payment';
import { OrderStatus } from '../../../../orders/domain/entities/Order';

/**
 * @swagger
 * components:
 *   schemas:
 *     Payment:
 *       type: object
 *       required:
 *         - orderId
 *         - amount
 *       properties:
 *         id:
 *           type: integer
 *           description: The payment ID
 *         orderId:
 *           type: integer
 *           description: The ID of the order being paid
 *         amount:
 *           type: number
 *           format: float
 *           description: The payment amount
 *         status:
 *           type: string
 *           enum: [PENDING, APPROVED, REJECTED]
 *           description: The payment status
 *         paymentMethod:
 *           type: string
 *           enum: [CREDIT_CARD, DEBIT_CARD, PIX, CASH]
 *           description: The payment method
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date and time when the payment was created
 *       example:
 *         id: 1
 *         orderId: 1
 *         amount: 25.98
 *         status: APPROVED
 *         paymentMethod: PIX
 *         createdAt: "2023-01-01T12:05:00Z"
 */

export class PaymentController {
    /**
     * @swagger
     * /payments/confirm:
     *   post:
     *     summary: Confirm payment for an order
     *     tags: [Payments]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - orderId
     *               - amount
     *             properties:
     *               orderId:
     *                 type: integer
     *                 description: The ID of the order to pay
     *               amount:
     *                 type: number
     *                 format: float
     *                 description: The payment amount
     *               paymentMethod:
     *                 type: string
     *                 enum: [CREDIT_CARD, DEBIT_CARD, PIX, CASH]
     *                 default: PIX
     *                 description: The payment method
     *     responses:
     *       200:
     *         description: Payment confirmed successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: Payment confirmed successfully
     *                 payment:
     *                   $ref: '#/components/schemas/Payment'
     *       400:
     *         description: Bad request - order is not in payment pending status
     *       404:
     *         description: Order not found
     *       500:
     *         description: Internal server error
     */
    async confirmPayment(req: Request, res: Response) {
        try {
            const { orderId, amount, paymentMethod = 'PIX' } = req.body;

            const dataSource = await getDataSource();
            const orderRepository = dataSource.getRepository(OrderEntity);
            const paymentRepository = dataSource.getRepository(Payment);

            const order = await orderRepository.findOne({ where: { id: orderId } });

            if (!order) {
                return res.status(404).json({ message: 'Order not found' });
            }

            if (order.status !== OrderStatus.PAYMENT_PENDING) {
                return res.status(400).json({ 
                    message: 'The order must be in PAYMENT_PENDING status to confirm payment' 
                });
            }

            const payment = paymentRepository.create({
                orderId,
                amount,
                status: 'APPROVED',
                paymentMethod
            });

            await paymentRepository.save(payment);

            order.status = OrderStatus.PAYMENT_CONFIRMED;
            await orderRepository.save(order);

            return res.status(200).json({
                message: 'Payment confirmed successfully',
                payment
            });
        } catch (error) {
            console.error('Error confirming payment:', error);
            return res.status(500).json({ 
                message: 'Error processing payment confirmation' 
            });
        }
    }
}
