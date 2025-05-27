import { DataSource } from 'typeorm';
import { CarrinhoController } from './adapters/in/web/CarrinhoController';
import { CarrinhoService } from './application/services/CarrinhoService';
import { InMemoryCarrinhoRepository } from './adapters/out/persistence/InMemoryCarrinhoRepository';
import { ProductModule } from '../../products/ProductModule'; // To get ProductRepository
import { TypeORMProductRepository } from '../../products/adapters/out/persistence/TypeORMProductRepository'; // Need concrete implementation
import { ProductEntity } from '../../products/adapters/out/persistence/entities/Product.entity';
import { CategoryEntity } from '../../categories/adapters/out/persistence/entities/Category.entity';

export class CarrinhoModule {
  private carrinhoController: CarrinhoController;

  constructor(dataSource: DataSource, productModule: ProductModule) {
    // Initialize dependencies
    const carrinhoRepository = new InMemoryCarrinhoRepository(); // Using In-Memory for now

    // Need a concrete ProductRepository instance. Assuming TypeORM implementation is used.
    // This might require ProductModule to expose its repository or re-instantiate it here.
    // For simplicity, re-instantiating TypeORMProductRepository.
    // Ideally, use dependency injection or get repository from ProductModule.
    const productOrmRepository = dataSource.getRepository(ProductEntity);
    const categoryOrmRepository = dataSource.getRepository(CategoryEntity);
    const productRepository = new TypeORMProductRepository(productOrmRepository, categoryOrmRepository);

    const carrinhoService = new CarrinhoService(carrinhoRepository, productRepository);
    this.carrinhoController = new CarrinhoController(carrinhoService);
  }

  getController(): CarrinhoController {
    return this.carrinhoController;
  }
}

