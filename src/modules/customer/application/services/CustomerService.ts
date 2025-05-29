import { Customer, CustomerDTO } from "../../domain/entities/Custumer";
import { CustomerUseCase } from "../../domain/ports/in/CustumerUseCase";
import { CustomerRepository } from "../../domain/ports/out/CustumerRepository";

/**
 * CustomerService
 *
 * This service implements the CustomerUseCase interface and contains the business logic
 * for customer operations. It uses the CustomerRepository (output port) for data access.
 */
export class CustomerService implements CustomerUseCase {
  private customerRepository: CustomerRepository;

  constructor(customerRepository: CustomerRepository) {
    this.customerRepository = customerRepository;
  }

  async getAllCustomers(): Promise<CustomerDTO[]> {
    return this.customerRepository.findAll();
  }

  async getCustomerById(id: number): Promise<CustomerDTO | null> {
    return this.customerRepository.findById(id);
  }

  async createCustomer(
    customerData: Omit<CustomerDTO, "id">
  ): Promise<CustomerDTO> {
    // Create customer entity with validation
    const customer = new Customer(
      null,
      customerData.name,
      customerData.email,
      customerData.cpf,
      customerData.phone
    );

    // Save to repository
    return this.customerRepository.save(customer);
  }

  async updateCustomer(
    id: number,
    customerData: Partial<Omit<CustomerDTO, "id">>
  ): Promise<CustomerDTO | null> {
    // Check if customer exists
    const existingCustomerDTO = await this.customerRepository.findById(id);
    if (!existingCustomerDTO) {
      return null;
    }

    // Create customer entity from existing data
    const customer = Customer.fromDTO(existingCustomerDTO);

    // Update fields that are provided
    if (customerData.name !== undefined) {
      customer.updateName(customerData.name);
    }
    if (customerData.email !== undefined) {
      customer.updateEmail(customerData.email);
    }
    if (customerData.cpf !== undefined) {
      customer.updateCpf(customerData.cpf);
    }
    if (customerData.phone !== undefined) {
      customer.updatePhone(customerData.phone);
    }

    // Update in repository
    return this.customerRepository.update(customer);
  }

  async deleteCustomer(id: number): Promise<boolean> {
    return this.customerRepository.delete(id);
  }
}
