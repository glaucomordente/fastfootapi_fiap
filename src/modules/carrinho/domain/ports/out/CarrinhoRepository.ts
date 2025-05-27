import { Carrinho } from "../../domain/entities/Carrinho";

/**
 * CarrinhoRepository Interface (Output Port)
 *
 * Defines operations for persisting and retrieving shopping carts.
 * The implementation might be in-memory, Redis, or another temporary storage,
 * depending on the chosen strategy.
 */
export interface CarrinhoRepository {
  /**
   * Find a cart by its session ID.
   * @param idSessao The session ID associated with the cart.
   * @returns Promise resolving to the Carrinho or null if not found.
   */
  findByIdSessao(idSessao: string): Promise<Carrinho | null>;

  /**
   * Save (create or update) a cart.
   * @param carrinho The cart entity to save.
   * @returns Promise resolving to the saved Carrinho.
   */
  save(carrinho: Carrinho): Promise<Carrinho>;

  /**
   * Delete a cart by its session ID.
   * @param idSessao The session ID of the cart to delete.
   * @returns Promise resolving to true if deleted, false otherwise.
   */
  deleteByIdSessao(idSessao: string): Promise<boolean>;
}

