import { DataSource } from 'typeorm';
import { PagamentoController } from './adapters/in/web/PagamentoController';
import { PagamentoService } from './application/services/PagamentoService';
import { TypeORMPagamentoRepository } from './adapters/out/persistence/TypeORMPagamentoRepository';
import { PagamentoEntity } from './adapters/out/persistence/entities/Pagamento.entity';
import { InMemoryCarrinhoRepository } from '../../carrinho/adapters/out/persistence/InMemoryCarrinhoRepository'; // Assuming in-memory for now
import { OrderModule } from '../../orders/OrderModule'; // To get OrderUseCase
import { CarrinhoModule } from '../../carrinho/CarrinhoModule'; // To get CarrinhoRepository (or instantiate)

export class PagamentoModule {
  private pagamentoController: PagamentoController;

  constructor(
    dataSource: DataSource,
    carrinhoModule: CarrinhoModule, // Pass CarrinhoModule to get its repo
    orderModule: OrderModule // Pass OrderModule to get its use case
  ) {
    // Initialize dependencies
    const pagamentoOrmRepository = dataSource.getRepository(PagamentoEntity);
    const pagamentoRepository = new TypeORMPagamentoRepository(pagamentoOrmRepository);

    // Get dependencies from other modules (adjust based on how they expose components)
    // For now, assuming CarrinhoModule exposes its repository and OrderModule its use case
    // This might need adjustment based on actual module implementations
    // Re-instantiating InMemoryCarrinhoRepository for simplicity if not exposed:
    const carrinhoRepository = new InMemoryCarrinhoRepository(); // Or get from carrinhoModule
    const orderUseCase = orderModule.getUseCase(); // Assuming OrderModule exposes getUseCase()

    const pagamentoService = new PagamentoService(
        pagamentoRepository,
        carrinhoRepository,
        orderUseCase
    );
    this.pagamentoController = new PagamentoController(pagamentoService);
  }

  getController(): PagamentoController {
    return this.pagamentoController;
  }
}

