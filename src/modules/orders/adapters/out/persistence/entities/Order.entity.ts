import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { OrderStatus } from '../../../../domain/entities/Order';
import { OrderItemEntity } from './OrderItem.entity';
import { CustomerEntity } from '../../../../../customer/adapters/out/persistence/entities/Customer.entity';

/**
 * Order Entity for TypeORM
 * 
 * This is the TypeORM entity that maps to the 'orders' table in the database.
 */
@Entity('orders')
export class OrderEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'customer_id', nullable: true })
  customerId: number;

  @Column({ name: 'transaction_id', unique: true })
  transactionId: number;

  @ManyToOne(() => CustomerEntity)
  @JoinColumn({ name: 'customer_id' })
  customer: CustomerEntity;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.IN_CART
  })
  status: OrderStatus;

  @Column({ name: 'total_amount', type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalAmount: number;

  @OneToMany(() => OrderItemEntity, orderItem => orderItem.order, {
    cascade: true,
    eager: true
  })
  items: OrderItemEntity[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
