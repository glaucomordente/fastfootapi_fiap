import { Customer, CustomerDTO } from "../../entities/Custumer";

/**
 * CustomerUseCase Interface (Input Port)
 *
 * This interface defines the operations that can be performed on customers.
 * It serves as the primary input port for the hexagonal architecture.
 * Application services will implement this interface to provide the actual business logic.
 */
export interface CustomerUseCase {
  /**
   * Get all customers
   * @returns Promise resolving to an array of CustomerDTO objects
   */
  getAllCustomers(): Promise<CustomerDTO[]>;

  /**
   * Get a customer by its ID
   * @param id The ID of the customer to retrieve
   * @returns Promise resolving to a CustomerDTO or null if not found
   */
  getCustomerById(id: number): Promise<CustomerDTO | null>;

  /**
   * Create a new customer
   * @param customerData The data for the new customer
   * @returns Promise resolving to the created CustomerDTO
   */
  createCustomer(customerData: Omit<CustomerDTO, "id">): Promise<CustomerDTO>;

  /**
   * Update an existing customer
   * @param id The ID of the customer to update
   * @param customerData The updated customer data
   * @returns Promise resolving to the updated CustomerDTO or null if not found
   */
  updateCustomer(
    id: number,
    customerData: Partial<Omit<CustomerDTO, "id">>
  ): Promise<CustomerDTO | null>;

  /**
   * Delete a customer
   * @param id The ID of the customer to delete
   * @returns Promise resolving to true if deleted, false if not found
   */
  deleteCustomer(id: number): Promise<boolean>;
}
