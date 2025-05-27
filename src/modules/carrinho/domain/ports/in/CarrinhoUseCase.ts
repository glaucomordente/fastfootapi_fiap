import { Carrinho, ItemCarrinho } from "../../domain/entities/Carrinho";

// DTO for adding item to cart
export interface AdicionarItemDTO {
  id_sessao: string;
  id_produto: string; // Product UUID
  quantidade: number;
  observacoes?: string;
}

// DTO for removing item from cart
export interface RemoverItemDTO {
  id_sessao: string;
  id_item_carrinho: string; // Cart Item UUID
}

// Response DTO for adding/removing item
export interface CarrinhoModificadoResponse {
  status: string;
  mensagem: string;
  id_item_carrinho?: string; // Only for add operation
  subtotal_carrinho: number;
  timestamp: string;
}

// Response DTO for confirming cart
export interface ConfirmarCarrinhoResponse {
  status: string;
  mensagem: string;
  carrinho_validado: boolean;
  total: number;
  proxima_etapa: string;
  timestamp: string;
}

// Response DTO for viewing cart
export interface VisualizarCarrinhoResponse {
  itens: any[]; // Array of items formatted as per contract
  subtotal: number;
  total: number;
  timestamp: string;
}

/**
 * CarrinhoUseCase Interface (Input Port)
 *
 * Defines operations for managing the shopping cart.
 */
export interface CarrinhoUseCase {
  /**
   * Add an item (lanche) to the cart.
   * @param data Data containing session ID, product ID, quantity, and observations.
   * @returns Promise resolving to the result of the operation.
   */
  adicionarItem(data: AdicionarItemDTO): Promise<CarrinhoModificadoResponse>;

  /**
   * Confirm the cart for checkout.
   * @param idSessao The session ID of the cart to confirm.
   * @returns Promise resolving to the confirmation result.
   */
  confirmarCarrinho(idSessao: string): Promise<ConfirmarCarrinhoResponse>;

  /**
   * View the contents of the cart.
   * @param idSessao The session ID of the cart to view.
   * @returns Promise resolving to the cart details or null if not found.
   */
  visualizarCarrinho(idSessao: string): Promise<VisualizarCarrinhoResponse | null>;

  /**
   * Remove an item from the cart.
   * @param data Data containing session ID and cart item ID.
   * @returns Promise resolving to the result of the operation.
   */
  removerItem(data: RemoverItemDTO): Promise<CarrinhoModificadoResponse>;
}

