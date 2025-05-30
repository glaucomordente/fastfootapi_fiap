import { CarrinhoController } from './adapters/in/web/controllers/CarrinhoController';
import { CarrinhoRepository } from './adapters/out/persistence/repositories/CarrinhoRepository';
import { CarrinhoService } from './application/services/CarrinhoService';

export class CarrinhoModule {
  private carrinhoController: CarrinhoController;
  private carrinhoService: CarrinhoService;
  private carrinhoRepository: CarrinhoRepository;

  constructor() {
    this.carrinhoRepository = new CarrinhoRepository();
    this.carrinhoService = new CarrinhoService(this.carrinhoRepository);
    this.carrinhoController = new CarrinhoController(this.carrinhoService);
  }

  getController(): CarrinhoController {
    return this.carrinhoController;
  }

  getService(): CarrinhoService {
    return this.carrinhoService;
  }

  getRepository(): CarrinhoRepository {
    return this.carrinhoRepository;
  }
} 