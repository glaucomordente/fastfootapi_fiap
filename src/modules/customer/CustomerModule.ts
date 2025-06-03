import { CustomerController } from './adapters/in/web/CustomerController';
import { TypeORMCustomerRepository } from './adapters/out/persistence/TypeORMCustomerRepository';
import { CustomerService } from './application/services/CustomerService';
import { CustomerUseCase } from './domain/ports/in/CustomerUseCase';
import { CustomerRepository } from './domain/ports/out/CustomerRepository';

/**
 * CustomerModule
 *
 * This module handles the dependency injection and configuration for the customers domain.
 * It wires together all the components of the hexagonal architecture.
 */
export class CustomerModule {
  private customerRepository: CustomerRepository;
  private customerService: CustomerUseCase;
  private customerController: CustomerController;
  private initialized: boolean = false;

  constructor() {
    // Initialize the repository (output adapter)
    this.customerRepository = new TypeORMCustomerRepository();
    
    // Initialize the service (application layer)
    this.customerService = new CustomerService(this.customerRepository);
    
    // Initialize the controller (input adapter)
    this.customerController = new CustomerController(this.customerService);
  }

  /**
   * Initialize the module
   * This method should be called before using the module
   */
  async initialize(): Promise<void> {
    if (!this.initialized) {
      // Initialize the repository
      await (this.customerRepository as TypeORMCustomerRepository).initialize();
      this.initialized = true;
    }
  }

  /**
   * Get the customer controller
   * @returns The customer controller instance
   */
  getController(): CustomerController {
    return this.customerController;
  }
}
