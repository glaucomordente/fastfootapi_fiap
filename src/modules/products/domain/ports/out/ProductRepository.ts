import { Product } from '../../domain/entities/Product'; // Assuming Product entity uses string ID now
import { ProductEntity } from '../persistence/entities/Product.entity'; // Assuming ProductEntity uses string ID now

// Define the structure expected by the API contract for a single product in the list
export interface ProdutoListagemDTO {
  id: string;
  nome: string;
  descricao: string | null;
  categoria: string; // Category name
  preco: number;
  imagem_url: string | null;
  disponivel: boolean;
  destaque: boolean;
}

/**
 * ProductRepository Interface (Output Port)
 *
 * This interface defines the operations for persisting and retrieving products.
 * Adapters will implement this interface to provide actual data access.
 */
export interface ProductRepository {
  /**
   * Find all products, optionally filtered by category name.
   * @param categoryName Optional category name to filter by.
   * @returns Promise resolving to an array of ProductListagemDTO objects.
   */
  findAll(categoryName?: string): Promise<ProdutoListagemDTO[]>;

  /**
   * Find a product by its ID (UUID).
   * @param id The UUID of the product to find.
   * @returns Promise resolving to a Product (domain entity) or null if not found.
   */
  findById(id: string): Promise<Product | null>;

  /**
   * Find products by category ID (assuming internal use or specific scenarios).
   * @param categoryId The ID of the category to filter by.
   * @returns Promise resolving to an array of Product (domain entities).
   */
  findByCategoryId(categoryId: number): Promise<Product[]>; // Keep internal version if needed

  /**
   * Save a new product.
   * @param product The product domain entity to save.
   * @returns Promise resolving to the saved Product domain entity.
   */
  save(product: Product): Promise<Product>;

  /**
   * Update an existing product.
   * @param product The product domain entity to update.
   * @returns Promise resolving to the updated Product domain entity or null if not found.
   */
  update(product: Product): Promise<Product | null>;

  /**
   * Delete a product by its ID (UUID).
   * @param id The UUID of the product to delete.
   * @returns Promise resolving to true if deleted, false if not found.
   */
  delete(id: string): Promise<boolean>;

  /**
   * Check if a category exists by its ID.
   * @param categoryId The ID of the category to check.
   * @returns Promise resolving to true if the category exists, false otherwise.
   */
  categoryExists(categoryId: number): Promise<boolean>;

   /**
   * Find category ID by name.
   * @param categoryName The name of the category.
   * @returns Promise resolving to the category ID or null if not found.
   */
  findCategoryIdByName(categoryName: string): Promise<number | null>;
}

