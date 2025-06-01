import { Customer, CustomerDTO } from "../../domain/entities/Customer";
import { CustomerUseCase } from "../../domain/ports/in/CustomerUseCase";
import { CustomerRepository } from "../../domain/ports/out/CustomerRepository";

/**
 * CustomerService
 *
 * This service implements the CustomerUseCase interface and contains the business logic
 * for customer operations. It uses the CustomerRepository (output port) for data access.
 */
export class CustomerService implements CustomerUseCase {
  constructor(private readonly customerRepository: CustomerRepository) {}

  async getAllCustomers(): Promise<Customer[]> {
    return this.customerRepository.findAll();
  }

  async getCustomerById(id: number): Promise<Customer | null> {
    return this.customerRepository.findById(id);
  }

  async createCustomer(customerData: CustomerDTO): Promise<Customer> {
    const customer = Customer.fromDTO(customerData);
    return this.customerRepository.create(customerData);
  }

  async updateCustomer(id: number, customerData: CustomerDTO): Promise<Customer> {
    const existingCustomer = await this.customerRepository.findById(id);
    if (!existingCustomer) {
      throw new Error("Customer not found");
    }

    const updatedCustomer = Customer.fromDTO({
      ...customerData,
      id
    });

    return this.customerRepository.update(id, customerData);
  }

  async deleteCustomer(id: number): Promise<void> {
    const existingCustomer = await this.customerRepository.findById(id);
    if (!existingCustomer) {
      throw new Error("Customer not found");
    }

    await this.customerRepository.delete(id);
  }
}
