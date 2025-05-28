import { Customer, CustomerDTO } from "../../entities/Custumer";

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
  findAll(): Promise<CustomerDTO[]>;

  /**
   * Find a customer by its ID
   * @param id The ID of the customer to find
   * @returns Promise resolving to a CustomerDTO or null if not found
   */
  findById(id: number): Promise<CustomerDTO | null>;

  /**
   * Save a new customer
   * @param customer The customer entity to save
   * @returns Promise resolving to the saved CustomerDTO with generated ID
   */
  save(customer: Customer): Promise<CustomerDTO>;

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
