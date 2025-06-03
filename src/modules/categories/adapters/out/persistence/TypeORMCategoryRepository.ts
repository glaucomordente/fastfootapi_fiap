import { Repository } from 'typeorm';
import { Category, CategoryDTO } from '../../../domain/entities/Category';
import { CategoryRepository } from '../../../domain/ports/out/CategoryRepository';
import { CategoryEntity } from './entities/Category.entity';
import { getDataSource } from '../../../../../lib/typeorm';

/**
 * TypeORMCategoryRepository
 * 
 * This class implements the CategoryRepository interface using TypeORM.
 * It serves as an output adapter for database operations.
 */
export class TypeORMCategoryRepository implements CategoryRepository {
  private repository: Repository<CategoryEntity>;

  constructor() {
    // Initialize repository - will be set in the initialize method
    this.repository = null;
  }

  /**
   * Initialize the repository
   * This method should be called before using any other methods
   */
  async initialize(): Promise<void> {
    const dataSource = await getDataSource();
    this.repository = dataSource.getRepository(CategoryEntity);
  }

  async findAll(): Promise<Category[]> {
    const categories = await this.repository.find();

    return categories.map(category => Category.fromDTO({
      id: category.id,
      name: category.name,
      description: category.description
    }));
  }

  async findById(id: number): Promise<Category | null> {
    const category = await this.repository.findOne({
      where: { id },
      relations: ['products']
    });

    if (!category) {
      return null;
    }

    return Category.fromDTO({
      id: category.id,
      name: category.name,
      description: category.description
    });
  }

  async save(category: Category): Promise<Category> {
    // Create or update based on whether the category has an ID
    if (category.id === null) {
      // Create new category
      const categoryEntity = new CategoryEntity();
      categoryEntity.name = category.name;
      categoryEntity.description = category.description;

      const savedCategory = await this.repository.save(categoryEntity);

      return Category.fromDTO({
        id: savedCategory.id,
        name: savedCategory.name,
        description: savedCategory.description
      });
    } else {
      // Update existing category
      // Check if category exists
      const existingCategory = await this.repository.findOne({
        where: { id: category.id as number }
      });

      if (!existingCategory) {
        throw new Error('Category not found');
      }

      // Update category
      existingCategory.name = category.name;
      existingCategory.description = category.description;

      const updatedCategory = await this.repository.save(existingCategory);

      return Category.fromDTO({
        id: updatedCategory.id,
        name: updatedCategory.name,
        description: updatedCategory.description
      });
    }
  }

  async delete(id: number): Promise<boolean> {
    // Check if category has products before deleting
    try {
      const count = await this.repository
        .createQueryBuilder('category')
        .innerJoin('category.products', 'product')
        .where('category.id = :id', { id })
        .getCount();

      if (count > 0) {
        throw new Error('Cannot delete category with associated products');
      }

      const result = await this.repository.delete(id);
      return result.affected > 0;
    } catch (error) {
      if (error.message === 'Cannot delete category with associated products') {
        throw error;
      }
      // If the error is not related to products, it might be a database error
      return false;
    }
  }
}
