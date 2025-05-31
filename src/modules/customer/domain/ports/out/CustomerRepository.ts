import { Customer, CustomerDTO } from "../../entities/Customer";

export interface CustomerRepository {
  findAll(): Promise<Customer[]>;
  findById(id: number): Promise<Customer | null>;
  create(customer: CustomerDTO): Promise<Customer>;
  update(id: number, customer: CustomerDTO): Promise<Customer | null>;
  delete(id: number): Promise<boolean>;
} 