import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import { OrderEntity } from '../modules/orders/adapters/out/persistence/entities/Order.entity';
import { Payment } from '../database/entities/Payment';
import { OrderStatus } from '../modules/orders/domain/entities/Order';

export class PaymentController {
    async confirmPayment(req: Request, res: Response) {
        try {
            const { orderId, amount, paymentMethod = 'PIX' } = req.body;

            const orderRepository = getRepository(OrderEntity);
            const paymentRepository = getRepository(Payment);

            const order = await orderRepository.findOne({ where: { id: orderId } });

            if (!order) {
                return res.status(404).json({ message: 'Pedido não encontrado' });
            }

            if (order.status !== OrderStatus.PAYMENT) {
                return res.status(400).json({ 
                    message: 'O pedido precisa estar no status PAYMENT para confirmar o pagamento' 
                });
            }

            const payment = paymentRepository.create({
                orderId,
                amount,
                status: 'APPROVED',
                paymentMethod
            });

            await paymentRepository.save(payment);

            order.status = OrderStatus.READY;
            await orderRepository.save(order);

            return res.status(200).json({
                message: 'Pagamento confirmado com sucesso',
                payment
            });
        } catch (error) {
            console.error('Erro ao confirmar pagamento:', error);
            return res.status(500).json({ 
                message: 'Erro ao processar a confirmação do pagamento' 
            });
        }
    }
} 