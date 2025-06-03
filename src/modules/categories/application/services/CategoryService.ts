import { Category, CategoryDTO } from '../../domain/entities/Category';
import { CategoryUseCase } from '../../domain/ports/in/CategoryUseCase';
import { CategoryRepository } from '../../domain/ports/out/CategoryRepository';

/**
 * CategoryService
 * 
 * This service implements the CategoryUseCase interface and contains the business logic
 * for category operations. It uses the CategoryRepository (output port) for data access.
 */
export class CategoryService implements CategoryUseCase {
  private categoryRepository: CategoryRepository;

  constructor(categoryRepository: CategoryRepository) {
    this.categoryRepository = categoryRepository;
  }

  async findAll(): Promise<Category[]> {
    return this.categoryRepository.findAll();
  }

  async findById(id: number): Promise<Category | null> {
    return this.categoryRepository.findById(id);
  }

  async save(category: Category): Promise<Category> {
    return this.categoryRepository.save(category);
  }

  async delete(id: number): Promise<boolean> {
    // Check if category exists
    const existingCategory = await this.categoryRepository.findById(id);
    if (!existingCategory) {
      return false;
    }
    
    return this.categoryRepository.delete(id);
  }
}
