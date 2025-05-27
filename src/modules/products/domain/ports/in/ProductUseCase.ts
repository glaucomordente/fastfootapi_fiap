import { Product } from '../../domain/entities/Product';
import { ProdutoListagemDTO } from '../../domain/ports/out/ProductRepository'; // Import the DTO

// Define the structure for creating/updating products, aligning with domain entity
// Using Partial for update
export type ProductUpdatePayload = Partial<{
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  categoryId: number;
  stock: number;
  disponivel: boolean;
  destaque: boolean;
}>;

// Define the structure for creating products
export type ProductCreatePayload = {
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  categoryId: number;
  stock?: number; // Optional stock
  disponivel?: boolean; // Optional
  destaque?: boolean; // Optional
};


/**
 * ProductUseCase Interface (Input Port)
 *
 * Defines operations for products, aligning with API contracts.
 */
export interface ProductUseCase {
  /**
   * List products, optionally filtered by category name.
   * @param categoryName Optional category name filter.
   * @returns Promise resolving to an array of products formatted for the API list response.
   */
  listarProdutos(categoryName?: string): Promise<{ produtos: ProdutoListagemDTO[]; timestamp: string }>;

  /**
   * Get a product by its ID (UUID).
   * @param id The UUID of the product.
   * @returns Promise resolving to a Product domain entity or null.
   */
  getProductById(id: string): Promise<Product | null>; // Keep internal method if needed

  /**
   * Create a new product.
   * @param productData Data for the new product.
   * @returns Promise resolving to the created Product domain entity.
   */
  createProduct(productData: ProductCreatePayload): Promise<Product>;

  /**
   * Update an existing product.
   * @param id The UUID of the product to update.
   * @param productData Updated data.
   * @returns Promise resolving to the updated Product domain entity or null.
   */
  updateProduct(id: string, productData: ProductUpdatePayload): Promise<Product | null>;

  /**
   * Delete a product.
   * @param id The UUID of the product to delete.
   * @returns Promise resolving to true if deleted, false otherwise.
   */
  deleteProduct(id: string): Promise<boolean>;
}

