import { Repository, DataSource } from 'typeorm';
import { Customer, CustomerDTO } from '../../../domain/entities/Customer';
import { CustomerRepository } from '../../../domain/ports/out/CustomerRepository';
import { CustomerEntity } from './entities/Customer.entity';
import { getDataSource } from '../../../../../lib/typeorm';

/**
 * TypeORMCustomerRepository
 * 
 * This is the TypeORM implementation of the CustomerRepository interface.
 * It uses TypeORM to interact with the database.
 */
export class TypeORMCustomerRepository implements CustomerRepository {
  private repository: Repository<CustomerEntity>;

  constructor() {
    // Repository will be initialized in the initialize method
  }

  /**
   * Initialize the repository
   */
  async initialize(): Promise<void> {
    const dataSource = await getDataSource();
    this.repository = dataSource.getRepository(CustomerEntity);
  }

  /**
   * Find all customers
   */
  async findAll(): Promise<Customer[]> {
    const customers = await this.repository.find();
    return customers.map((customer) => Customer.fromDTO(customer));
  }

  /**
   * Find a customer by ID
   */
  async findById(id: number): Promise<Customer | null> {
    const customer = await this.repository.findOne({ where: { id } });
    if (!customer) {
      return null;
    }
    return Customer.fromDTO(customer);
  }

  /**
   * Find a customer by email
   */
  async findByEmail(email: string): Promise<Customer | null> {
    const customer = await this.repository.findOne({ where: { email } });
    if (!customer) {
      return null;
    }
    return Customer.fromDTO(customer);
  }

  /**
   * Find a customer by CPF
   */
  async findByCPF(cpf: string): Promise<Customer | null> {
    const customer = await this.repository.findOne({ where: { cpf } });
    if (!customer) {
      return null;
    }
    return Customer.fromDTO(customer);
  }

  /**
   * Save a customer (create or update)
   */
  async save(customer: Customer): Promise<Customer> {
    const customerDTO = {
      id: customer.id as number,
      name: customer.name,
      email: customer.email,
      cpf: customer.cpf,
      phone: customer.phone
    };
    
    if (customerDTO.id) {
      // Update existing customer
      const existingCustomer = await this.repository.findOne({
        where: { id: customerDTO.id },
      });

      if (!existingCustomer) {
        throw new Error("Customer not found");
      }

      existingCustomer.name = customerDTO.name;
      existingCustomer.email = customerDTO.email;
      existingCustomer.cpf = customerDTO.cpf;
      existingCustomer.phone = customerDTO.phone;

      const updatedCustomer = await this.repository.save(existingCustomer);
      return Customer.fromDTO(updatedCustomer);
    } else {
      // Create new customer
      const customerEntity = new CustomerEntity();
      customerEntity.name = customerDTO.name;
      customerEntity.email = customerDTO.email;
      customerEntity.cpf = customerDTO.cpf;
      customerEntity.phone = customerDTO.phone;

      const savedCustomer = await this.repository.save(customerEntity);
      return Customer.fromDTO(savedCustomer);
    }
  }

  /**
   * Delete a customer
   */
  async delete(id: number): Promise<boolean> {
    const result = await this.repository.delete(id);
    return result.affected !== undefined && result.affected > 0;
  }
}
