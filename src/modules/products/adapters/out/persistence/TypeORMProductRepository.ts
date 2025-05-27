import { Injectable } from '@nestjs/common'; // Adjust if not using NestJS
import { InjectRepository } from '@nestjs/typeorm'; // Adjust if not using NestJS
import { Repository, FindOptionsWhere, ILike } from 'typeorm';
import { Product } from '../../domain/entities/Product'; // Assuming Product entity uses string ID now
import { ProductRepository, ProdutoListagemDTO } from '../../domain/ports/out/ProductRepository';
import { ProductEntity } from './entities/Product.entity';
import { CategoryEntity } from '../../../categories/adapters/out/persistence/entities/Category.entity'; // Adjust path
import { v4 as uuidv4 } from 'uuid';

// @Injectable() // Uncomment if using NestJS DI
export class TypeORMProductRepository implements ProductRepository {

  // constructor(
  //   @InjectRepository(ProductEntity)
  //   private readonly productRepository: Repository<ProductEntity>,
  //   @InjectRepository(CategoryEntity) // Inject Category repository
  //   private readonly categoryRepository: Repository<CategoryEntity>,
  // ) {}
  // Basic implementation without NestJS DI for now
  constructor(
      private readonly productOrmRepository: Repository<ProductEntity>,
      private readonly categoryOrmRepository: Repository<CategoryEntity> // Need Category repo
  ) {}

  private mapEntityToDomain(entity: ProductEntity): Product {
      // Assuming Product domain entity constructor matches ProductEntity structure
      // Or create a specific mapping function if needed
      return new Product(
          entity.id,
          entity.nome,
          entity.descricao,
          entity.preco,
          entity.imagemUrl,
          entity.categoryId, // Keep categoryId internally in domain if needed
          entity.stock,
          entity.createdAt,
          entity.updatedAt,
          entity.disponivel, // Add new fields
          entity.destaque,   // Add new fields
          entity.categoria?.name // Pass category name if available
      );
  }

  private mapDomainToEntity(domain: Product): Partial<ProductEntity> {
      return {
          id: domain.id || uuidv4(), // Ensure ID exists
          nome: domain.name,
          descricao: domain.description,
          preco: domain.price,
          imagemUrl: domain.imageUrl,
          categoryId: domain.categoryId,
          stock: domain.stock,
          disponivel: domain.disponivel,
          destaque: domain.destaque,
          // createdAt and updatedAt are handled by TypeORM
      };
  }

  private mapEntityToListagemDTO(entity: ProductEntity): ProdutoListagemDTO {
      return {
          id: entity.id,
          nome: entity.nome,
          descricao: entity.descricao,
          categoria: entity.categoria?.name || 'Categoria Desconhecida', // Use category name from relation
          preco: entity.preco,
          imagem_url: entity.imagemUrl,
          disponivel: entity.disponivel,
          destaque: entity.destaque,
      };
  }

  async findAll(categoryName?: string): Promise<ProdutoListagemDTO[]> {
      const whereClause: FindOptionsWhere<ProductEntity> = {};

      if (categoryName) {
          // Find category by name first to get its ID
          const category = await this.categoryOrmRepository.findOne({ where: { name: ILike(categoryName) } });
          if (!category) {
              return []; // No products if category doesn't exist
          }
          whereClause.categoryId = category.id;
      }

      const entities = await this.productOrmRepository.find({
          where: whereClause,
          relations: ['categoria'], // Ensure category relation is loaded
          order: { nome: 'ASC' } // Example ordering
      });

      return entities.map(this.mapEntityToListagemDTO);
  }

  async findById(id: string): Promise<Product | null> {
    const entity = await this.productOrmRepository.findOne({ where: { id }, relations: ['categoria'] });
    return entity ? this.mapEntityToDomain(entity) : null;
  }

  async findByCategoryId(categoryId: number): Promise<Product[]> {
    const entities = await this.productOrmRepository.find({ where: { categoryId }, relations: ['categoria'] });
    return entities.map(this.mapEntityToDomain);
  }

  async save(product: Product): Promise<Product> {
    const entityData = this.mapDomainToEntity(product);
    // Ensure category exists before saving
    const categoryExists = await this.categoryExists(entityData.categoryId!);
    if (!categoryExists) {
        throw new Error(`Categoria com ID ${entityData.categoryId} não encontrada.`);
    }

    const entity = this.productOrmRepository.create(entityData as ProductEntity);
    const savedEntity = await this.productOrmRepository.save(entity);
    // Re-fetch to include relations like category name
    const reloadedEntity = await this.productOrmRepository.findOneOrFail({ where: { id: savedEntity.id }, relations: ['categoria'] });
    return this.mapEntityToDomain(reloadedEntity);
  }

  async update(product: Product): Promise<Product | null> {
    const entity = await this.productOrmRepository.findOne({ where: { id: product.id! } });
    if (!entity) {
      return null;
    }

    const updateData = this.mapDomainToEntity(product);
    // Ensure category exists if it's being changed
    if (updateData.categoryId && updateData.categoryId !== entity.categoryId) {
        const categoryExists = await this.categoryExists(updateData.categoryId);
        if (!categoryExists) {
            throw new Error(`Categoria com ID ${updateData.categoryId} não encontrada.`);
        }
    }

    // Merge updates
    this.productOrmRepository.merge(entity, updateData);
    const updatedEntity = await this.productOrmRepository.save(entity);
    // Re-fetch to include relations
    const reloadedEntity = await this.productOrmRepository.findOneOrFail({ where: { id: updatedEntity.id }, relations: ['categoria'] });
    return this.mapEntityToDomain(reloadedEntity);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.productOrmRepository.delete(id);
    return result.affected !== null && result.affected !== undefined && result.affected > 0;
  }

  async categoryExists(categoryId: number): Promise<boolean> {
    const count = await this.categoryOrmRepository.count({ where: { id: categoryId } });
    return count > 0;
  }

  async findCategoryIdByName(categoryName: string): Promise<number | null> {
      const category = await this.categoryOrmRepository.findOne({ where: { name: ILike(categoryName) } });
      return category ? category.id : null;
  }
}

