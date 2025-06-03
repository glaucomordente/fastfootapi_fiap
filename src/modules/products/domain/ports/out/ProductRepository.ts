import { Product } from '../../entities/Product';

/**
 * ProductRepository interface
 * 
 * This interface defines the contract for the repository that handles Product entities.
 * It follows the repository pattern and is part of the hexagonal architecture.
 */
export interface ProductRepository {
  /**
   * Find all products
   * @returns Promise with an array of products
   */
  findAll(): Promise<Product[]>;
  
  /**
   * Find a product by its ID
   * @param id The product ID
   * @returns Promise with the product or null if not found
   */
  findById(id: number): Promise<Product | null>;
  
  /**
   * Find products by category ID
   * @param categoryId The category ID
   * @returns Promise with an array of products
   */
  findByCategoryId(categoryId: number): Promise<Product[]>;
  
  /**
   * Save a product (create or update)
   * @param product The product to save
   * @returns Promise with the saved product
   */
  save(product: Product): Promise<Product>;
  
  /**
   * Update an existing product
   * @param product The product to update
   * @returns Promise with the updated product or null if not found
   */
  update(product: Product): Promise<Product | null>;
  
  /**
   * Delete a product by its ID
   * @param id The product ID
   * @returns Promise with a boolean indicating if the product was deleted
   */
  delete(id: number): Promise<boolean>;
  
  /**
   * Check if a category exists
   * @param categoryId The category ID
   * @returns Promise with a boolean indicating if the category exists
   */
  categoryExists(categoryId: number): Promise<boolean>;
  
  /**
   * Initialize the repository
   * This method should be called before using the repository
   */
  initialize?(): Promise<void>;
}
