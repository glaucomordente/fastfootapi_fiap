import { Category } from '../../entities/Category';

/**
 * CategoryRepository interface
 * 
 * This interface defines the contract for the repository that handles Category entities.
 * It follows the repository pattern and is part of the hexagonal architecture.
 */
export interface CategoryRepository {
  /**
   * Find all categories
   * @returns Promise with an array of categories
   */
  findAll(): Promise<Category[]>;
  
  /**
   * Find a category by its ID
   * @param id The category ID
   * @returns Promise with the category or null if not found
   */
  findById(id: number): Promise<Category | null>;
  
  /**
   * Save a category (create or update)
   * @param category The category to save
   * @returns Promise with the saved category
   */
  save(category: Category): Promise<Category>;
  
  /**
   * Delete a category by its ID
   * @param id The category ID
   * @returns Promise with a boolean indicating if the category was deleted
   */
  delete(id: number): Promise<boolean>;
  
  /**
   * Initialize the repository
   * This method should be called before using the repository
   */
  initialize?(): Promise<void>;
}
