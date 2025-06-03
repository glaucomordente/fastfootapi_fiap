import { Repository } from 'typeorm';
import { Product, ProductDTO } from '../../../domain/entities/Product';
import { ProductRepository } from '../../../domain/ports/out/ProductRepository';
import { ProductEntity } from './entities/Product.entity';
import { CategoryEntity } from '../../../../categories/adapters/out/persistence/entities/Category.entity';
import { getDataSource } from '../../../../../lib/typeorm';

/**
 * TypeORMProductRepository
 * 
 * This class implements the ProductRepository interface using TypeORM.
 * It serves as an output adapter for database operations.
 */
export class TypeORMProductRepository implements ProductRepository {
  private productRepository: Repository<ProductEntity>;
  private categoryRepository: Repository<CategoryEntity>;

  constructor() {
    // Initialize repositories - will be set in the initialize method
    this.productRepository = null;
    this.categoryRepository = null;
  }

  /**
   * Initialize the repository
   * This method should be called before using any other methods
   */
  async initialize(): Promise<void> {
    const dataSource = await getDataSource();
    this.productRepository = dataSource.getRepository(ProductEntity);
    this.categoryRepository = dataSource.getRepository(CategoryEntity);
  }

  async findAll(): Promise<Product[]> {
    const products = await this.productRepository.find({
      relations: ['category']
    });

    return products.map(product => {
      const productDTO: ProductDTO = {
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        imageUrl: product.imageUrl,
        categoryId: product.categoryId,
        stock: product.stock,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt
      };
      return Product.fromDTO(productDTO);
    });
  }

  async findById(id: number): Promise<Product | null> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['category']
    });

    if (!product) {
      return null;
    }

    const productDTO: ProductDTO = {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      imageUrl: product.imageUrl,
      categoryId: product.categoryId,
      stock: product.stock,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt
    };
    
    return Product.fromDTO(productDTO);
  }

  async findByCategoryId(categoryId: number): Promise<Product[]> {
    const products = await this.productRepository.find({
      where: { categoryId },
      relations: ['category']
    });

    return products.map(product => {
      const productDTO: ProductDTO = {
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        imageUrl: product.imageUrl,
        categoryId: product.categoryId,
        stock: product.stock,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt
      };
      return Product.fromDTO(productDTO);
    });
  }

  async save(product: Product): Promise<Product> {
    const productEntity = new ProductEntity();
    productEntity.name = product.name;
    productEntity.description = product.description;
    productEntity.price = product.price;
    productEntity.imageUrl = product.imageUrl;
    productEntity.categoryId = product.categoryId;
    productEntity.stock = product.stock;
    // createdAt and updatedAt will be automatically set by TypeORM

    const savedProduct = await this.productRepository.save(productEntity);

    const productDTO: ProductDTO = {
      id: savedProduct.id,
      name: savedProduct.name,
      description: savedProduct.description,
      price: savedProduct.price,
      imageUrl: savedProduct.imageUrl,
      categoryId: savedProduct.categoryId,
      stock: savedProduct.stock,
      createdAt: savedProduct.createdAt,
      updatedAt: savedProduct.updatedAt
    };
    
    return Product.fromDTO(productDTO);
  }

  async update(product: Product): Promise<Product | null> {
    // Ensure product has an ID
    if (product.id === null) {
      throw new Error('Cannot update product without ID');
    }

    // Check if product exists
    const existingProduct = await this.productRepository.findOne({
      where: { id: product.id }
    });

    if (!existingProduct) {
      return null;
    }

    // Update product
    existingProduct.name = product.name;
    existingProduct.description = product.description;
    existingProduct.price = product.price;
    existingProduct.imageUrl = product.imageUrl;
    existingProduct.categoryId = product.categoryId;
    existingProduct.stock = product.stock;
    // updatedAt will be automatically updated by TypeORM

    const updatedProduct = await this.productRepository.save(existingProduct);

    const productDTO: ProductDTO = {
      id: updatedProduct.id,
      name: updatedProduct.name,
      description: updatedProduct.description,
      price: updatedProduct.price,
      imageUrl: updatedProduct.imageUrl,
      categoryId: updatedProduct.categoryId,
      stock: updatedProduct.stock,
      createdAt: updatedProduct.createdAt,
      updatedAt: updatedProduct.updatedAt
    };
    
    return Product.fromDTO(productDTO);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.productRepository.delete(id);
    return result.affected > 0;
  }

  async categoryExists(categoryId: number): Promise<boolean> {
    const category = await this.categoryRepository.findOne({
      where: { id: categoryId }
    });
    return category !== null;
  }
}
