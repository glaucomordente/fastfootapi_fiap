import { Order } from "../../domain/entities/Order";

// DTO for creating an order
export interface CreateOrderDTO {
  clienteId?: string;
  itens: Array<{
    produtoId: string;
    quantidade: number;
    precoUnitario: number;
    observacoes?: string | null;
  }>;
  valorTotal: number;
  pagamentoId: string; // Link to the payment
}

/**
 * OrderUseCase Interface (Input Port)
 *
 * Defines operations for managing orders.
 */
export interface OrderUseCase {
  /**
   * Create a new order.
   * @param orderData Data for the new order.
   * @returns Promise resolving to the created Order entity.
   */
  createOrder(orderData: CreateOrderDTO): Promise<Order>;

  /**
   * Get an order by its ID.
   * @param id The ID of the order.
   * @returns Promise resolving to the Order entity or null.
   */
  getOrderById(id: string): Promise<Order | null>;

  // Add other methods as needed (e.g., updateStatus, listOrders, etc.)
}

