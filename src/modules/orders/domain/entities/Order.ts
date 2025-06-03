/**
 * Order Entity
 * 
 * This is a domain entity that represents an order in our system.
 * It contains the core business logic and validation rules for orders.
 */
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity("orders")
export class Order {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ nullable: true })
  customerId: string;

  @Column({ unique: true })
  transactionId: number;

  @Column()
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

/**
 * OrderItem Entity
 * 
 * This is a domain entity that represents an item in an order.
 */
export class OrderItem {
  private _id: number | null;
  private _productId: number;
  private _quantity: number;
  private _unitPrice: number;
  private _orderId: number | null;
  private _observation: string | null;

  constructor(
    id: number | null,
    productId: number,
    quantity: number,
    unitPrice: number,
    orderId: number | null,
    observation: string | null = null
  ) {
    // Validate inputs
    if (quantity <= 0) {
      throw new Error('Quantity must be greater than zero');
    }

    if (unitPrice <= 0) {
      throw new Error('Unit price must be greater than zero');
    }

    this._id = id;
    this._productId = productId;
    this._quantity = quantity;
    this._unitPrice = unitPrice;
    this._orderId = orderId;
    this._observation = observation;
  }

  // Getters
  get id(): number | null {
    return this._id;
  }

  get productId(): number {
    return this._productId;
  }

  get quantity(): number {
    return this._quantity;
  }

  get unitPrice(): number {
    return this._unitPrice;
  }

  get orderId(): number | null {
    return this._orderId;
  }

  get observation(): string | null {
    return this._observation;
  }

  // Calculate total price for this item
  get totalPrice(): number {
    return this._quantity * this._unitPrice;
  }
}

// Order status enum
export enum OrderStatus {
  IN_CART = 'IN_CART',                   // The customer has added items to their cart but hasn't submitted the order yet
  PAYMENT_PENDING = 'PAYMENT_PENDING',   // The order is awaiting payment confirmation
  PAYMENT_CONFIRMED = 'PAYMENT_CONFIRMED', // Payment has been successfully processed
  IN_PREPARATION = 'IN_PREPARATION',     // The kitchen is actively preparing the order
  READY_FOR_PICKUP = 'READY_FOR_PICKUP', // The order is complete and ready for the customer to pick up
  PICKED_UP = 'PICKED_UP',                // The customer has picked up
  COMPLETED = 'COMPLETED',               // The order ir completed
  CANCELED = 'CANCELED'                  // The order was cancelled by the customer or restaurant before completion
}

// Data Transfer Object interfaces
export interface OrderDTO {
  id: number | null;
  customerId?: number;
  transactionId: number;
  status: OrderStatus;
  totalAmount: number;
  items: OrderItemDTO[];
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItemDTO {
  id: number;
  productId: number;
  quantity: number;
  unitPrice: number;
  observation?: string;
  product?: {
    id: number;
    name: string;
    description: string;
    price: number;
    imageUrl: string;
  };
}

// Input DTOs for creating orders
export interface CreateOrderItemDTO {
  productId: number;
  quantity: number;
  observation?: string;
}

export interface CreateOrderDTO {
  customerId?: number;
  transactionId: number;
  items: CreateOrderItemDTO[];
}
