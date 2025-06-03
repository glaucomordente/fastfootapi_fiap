import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CustomerEntity } from "./adapters/out/persistence/entities/Customer.entity";
import { CustomerController } from "./adapters/in/web/CustomerController";
import { CustomerService } from "./application/services/CustomerService";
import { TypeORMCustomerRepository } from "./adapters/out/persistence/TypeORMCustomerRepository";

/**
 * CustomerModule
 *
 * This module handles the dependency injection and configuration for the customers domain.
 * It wires together all the components of the hexagonal architecture.
 */
@Module({
  imports: [TypeOrmModule.forFeature([CustomerEntity])],
  controllers: [CustomerController],
  providers: [CustomerService, TypeORMCustomerRepository],
  exports: [CustomerService, TypeORMCustomerRepository],
})
export class CustomerModule {
  private customerController: CustomerController;

  constructor() {
    // Initialize the controller (input adapter)
    this.customerController = new CustomerController();
  }
}
