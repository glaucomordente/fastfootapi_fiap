import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { OrderEntity } from '../../modules/orders/adapters/out/persistence/entities/Order.entity';

@Entity('payments')
export class Payment {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'order_id' })
    orderId: number;

    @ManyToOne(() => OrderEntity)
    @JoinColumn({ name: 'order_id' })
    order: OrderEntity;

    @Column('decimal', { precision: 10, scale: 2 })
    amount: number;

    @Column({
        type: 'enum',
        enum: ['APPROVED', 'REJECTED'],
        default: 'APPROVED'
    })
    status: 'APPROVED' | 'REJECTED';

    @Column({
        type: 'enum',
        enum: ['PIX', 'CREDIT_CARD', 'DEBIT_CARD'],
        default: 'PIX'
    })
    paymentMethod: 'PIX' | 'CREDIT_CARD' | 'DEBIT_CARD';

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
} 