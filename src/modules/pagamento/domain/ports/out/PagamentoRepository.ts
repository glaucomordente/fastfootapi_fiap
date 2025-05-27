import { Pagamento } from "../../domain/entities/Pagamento";

/**
 * PagamentoRepository Interface (Output Port)
 *
 * Defines operations for persisting and retrieving payment information.
 */
export interface PagamentoRepository {
  /**
   * Find a payment by its ID (UUID).
   * @param id The UUID of the payment.
   * @returns Promise resolving to the Pagamento entity or null if not found.
   */
  findById(id: string): Promise<Pagamento | null>;

  /**
   * Find a payment by its associated session ID.
   * Useful for linking cart session to payment.
   * Note: A session might have multiple payment attempts; consider logic for handling this.
   * @param idSessao The session ID.
   * @returns Promise resolving to the latest Pagamento entity for the session or null.
   */
  findBySessaoId(idSessao: string): Promise<Pagamento | null>; // Or potentially Pagamento[]

  /**
   * Save (create or update) a payment.
   * @param pagamento The payment entity to save.
   * @returns Promise resolving to the saved Pagamento entity.
   */
  save(pagamento: Pagamento): Promise<Pagamento>;

  // Add other methods if needed, e.g., findByStatus, findByPedidoId, etc.
}

