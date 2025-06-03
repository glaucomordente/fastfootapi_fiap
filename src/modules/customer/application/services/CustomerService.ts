import { Customer, CustomerDTO } from "../../domain/entities/Customer";
import { CustomerUseCase, Order } from "../../domain/ports/in/CustomerUseCase";
import { CustomerRepository } from "../../domain/ports/out/CustomerRepository";

/**
 * CustomerService
 *
 * This service implements the CustomerUseCase interface and contains the business logic
 * for customer operations. It uses the CustomerRepository (output port) for data access.
 */
export class CustomerService implements CustomerUseCase {
  constructor(private readonly customerRepository: CustomerRepository) {}

  /**
   * Find all customers
   */
  async findAll(): Promise<Customer[]> {
    return this.customerRepository.findAll();
  }

  /**
   * Find a customer by ID
   */
  async findById(id: number): Promise<Customer | null> {
    return this.customerRepository.findById(id);
  }

  /**
   * Find a customer by email
   */
  async findByEmail(email: string): Promise<Customer | null> {
    return this.customerRepository.findByEmail(email);
  }

  /**
   * Find a customer by CPF
   */
  async findByCPF(cpf: string): Promise<Customer | null> {
    return this.customerRepository.findByCPF(cpf);
  }

  /**
   * Save a customer (create or update)
   */
  async save(customer: Customer): Promise<Customer> {
    return this.customerRepository.save(customer);
  }

  /**
   * Delete a customer
   */
  async delete(id: number): Promise<boolean> {
    const existingCustomer = await this.customerRepository.findById(id);
    if (!existingCustomer) {
      throw new Error("Customer not found");
    }

    return this.customerRepository.delete(id);
  }

  /**
   * Get all orders for a specific customer
   */
  async getCustomerOrders(customerId: number): Promise<Order[]> {
    // This would typically call an OrderRepository to get orders by customer ID
    // For now, we'll return an empty array as a placeholder
    return [];
  }
}
