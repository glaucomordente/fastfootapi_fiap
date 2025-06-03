import { Customer } from '../../entities/Customer';

/**
 * CustomerRepository interface
 * 
 * This interface defines the contract for the repository that handles Customer entities.
 * It follows the repository pattern and is part of the hexagonal architecture.
 */
export interface CustomerRepository {
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
   * Initialize the repository
   * This method should be called before using the repository
   */
  initialize?(): Promise<void>;
}
