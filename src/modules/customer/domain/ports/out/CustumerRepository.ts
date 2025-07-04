import { Customer, CustomerDTO } from "../../entities/Customer";

/**
 * CustomerRepository Interface (Output Port)
 *
 * This interface defines the operations for persisting and retrieving customers.
 * It serves as the secondary output port for the hexagonal architecture.
 * Adapters will implement this interface to provide actual data access.
 */
export interface CustomerRepository {
  /**
   * Find all customers
   * @returns Promise resolving to an array of CustomerDTO objects
   */
  findAll(): Promise<Customer[]>;

  /**
   * Find a customer by its ID
   * @param id The ID of the customer to find
   * @returns Promise resolving to a CustomerDTO or null if not found
   */
  findById(id: number): Promise<Customer | null>;

  /**
   * Find a customer by its email
   * @param email The email of the customer to find
   * @returns Promise resolving to a CustomerDTO or null if not found
   */
  findByEmail(email: string): Promise<Customer | null>;

  /**
   * Find a customer by its CPF
   * @param cpf The CPF of the customer to find
   * @returns Promise resolving to a CustomerDTO or null if not found
   */
  findByCpf(cpf: string): Promise<Customer | null>;

  /**
   * Save a new customer
   * @param customer The customer entity to save
   * @returns Promise resolving to the saved CustomerDTO with generated ID
   */
  create(customer: CustomerDTO): Promise<Customer>;

  /**
   * Update an existing customer
   * @param customer The customer entity to update
   * @returns Promise resolving to the updated CustomerDTO or null if not found
   */
  update(customer: Customer): Promise<CustomerDTO | null>;

  /**
   * Delete a customer by its ID
   * @param id The ID of the customer to delete
   * @returns Promise resolving to true if deleted, false if not found
   */
  delete(id: number): Promise<boolean>;
}
