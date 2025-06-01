import { Repository, DataSource } from 'typeorm';
import { Customer, CustomerDTO } from '../../../domain/entities/Customer';
import { CustomerRepository } from '../../../domain/ports/out/CustomerRepository';
import { CustomerEntity } from './entities/Customer.entity';

/**
 * TypeORMCustomerRepository
 * 
 * This is the TypeORM implementation of the CustomerRepository interface.
 * It uses TypeORM to interact with the database.
 */
export class TypeORMCustomerRepository implements CustomerRepository {
  private repository: Repository<CustomerEntity>;

  constructor(dataSource: DataSource) {
    this.repository = dataSource.getRepository(CustomerEntity);
  }

  async findAll(): Promise<Customer[]> {
    const customers = await this.repository.find();
    return customers.map((customer) => Customer.fromDTO(customer));
  }

  async findById(id: number): Promise<Customer | null> {
    const customer = await this.repository.findOne({ where: { id } });
    if (!customer) {
      return null;
    }
    return Customer.fromDTO(customer);
  }

  async create(customer: CustomerDTO): Promise<Customer> {
    const customerEntity = new CustomerEntity();
    customerEntity.name = customer.name;
    customerEntity.email = customer.email;
    customerEntity.cpf = customer.cpf;
    customerEntity.phone = customer.phone ?? null;

    const savedCustomer = await this.repository.save(customerEntity);
    return Customer.fromDTO(savedCustomer);
  }

  async update(id: number, customer: CustomerDTO): Promise<Customer | null> {
    const existingCustomer = await this.repository.findOne({
      where: { id },
    });

    if (!existingCustomer) {
      return null;
    }

    existingCustomer.name = customer.name;
    existingCustomer.email = customer.email;
    existingCustomer.cpf = customer.cpf;
    existingCustomer.phone = customer.phone ?? null;

    const updatedCustomer = await this.repository.save(existingCustomer);
    return Customer.fromDTO(updatedCustomer);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.repository.delete(id);
    return result.affected !== undefined && result.affected > 0;
  }
}
