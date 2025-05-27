import { getRepository } from 'typeorm'; // Or getDataSource if using TypeORM v0.3+
import { ClienteEntity } from './adapters/out/persistence/entities/Cliente.entity';
import { TypeORMClienteRepository } from './adapters/out/persistence/TypeORMClienteRepository';
import { ClienteService } from './application/services/ClienteService';
import { ClienteController } from './adapters/in/web/ClienteController';
import { DataSource } from 'typeorm'; // Import DataSource

export class ClienteModule {
  private clienteController: ClienteController;

  constructor(dataSource: DataSource) { // Accept DataSource
    // Initialize dependencies
    // const clienteRepositoryORM = getRepository(ClienteEntity); // For TypeORM < 0.3
    const clienteRepositoryORM = dataSource.getRepository(ClienteEntity); // For TypeORM >= 0.3
    const clienteRepository = new TypeORMClienteRepository(clienteRepositoryORM);
    const clienteService = new ClienteService(clienteRepository);
    this.clienteController = new ClienteController(clienteService);
  }

  getController(): ClienteController {
    return this.clienteController;
  }
}

