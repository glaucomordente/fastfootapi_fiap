import { Customer } from "../../entities/Customer";

// Simple Order interface for use within the customer module
export interface Order {
  id: string | number;
  customerId?: string | number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  // Add other properties as needed
}

/**
 * CustomerUseCase interface
 * 
 * This interface defines the contract for the application service that handles customer use cases.
 * It follows the hexagonal architecture pattern as an input port.
 */
export interface CustomerUseCase {
  /**
   * Find all customers
   * @returns Promise with an array of customers
   */
  findAll(): Promise<Customer[]>;
  
  /**
   * Find a customer by its ID
   * @param id The customer ID
   * @returns Promise with the customer or null if not found
   */
  findById(id: number): Promise<Customer | null>;
  
  /**
   * Find a customer by email
   * @param email The customer email
   * @returns Promise with the customer or null if not found
   */
  findByEmail(email: string): Promise<Customer | null>;
  
  /**
   * Find a customer by CPF
   * @param cpf The customer CPF
   * @returns Promise with the customer or null if not found
   */
  findByCPF(cpf: string): Promise<Customer | null>;
  
  /**
   * Save a customer (create or update)
   * @param customer The customer to save
   * @returns Promise with the saved customer
   */
  save(customer: Customer): Promise<Customer>;
  
  /**
   * Delete a customer by its ID
   * @param id The customer ID
   * @returns Promise with a boolean indicating if the customer was deleted
   */
  delete(id: number): Promise<boolean>;
  
  /**
   * Get all orders for a specific customer
   * @param customerId The customer ID
   * @returns Promise with an array of orders
   */
  getCustomerOrders(customerId: number): Promise<Order[]>;
}
