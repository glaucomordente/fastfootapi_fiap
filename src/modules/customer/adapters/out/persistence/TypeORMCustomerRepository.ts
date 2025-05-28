import { Repository } from "typeorm";
import { Customer, CustomerDTO } from "../../../domain/entities/Custumer";
import { CustomerRepository } from "../../../domain/ports/out/CustumerRepository";
import { CustumerEntity } from "./entities/Customer.entity";
import { getDataSource } from "../../../../../lib/typeorm";

/**
 * TypeORMCustumerRepository
 *
 * This class implements the CustomerRepository interface using TypeORM.
 * It serves as an output adapter for database operations.
 */
export class TypeORMCustomerRepository implements CustomerRepository {
  private repository: Repository<CustumerEntity> | null = null;

  constructor() {
    // Repository will be set in the initialize method
  }

  /**
   * Initialize the repository
   * This method should be called before using any other methods
   */
  async initialize(): Promise<void> {
    const dataSource = await getDataSource();
    this.repository = dataSource.getRepository(CustumerEntity);
  }

  async findAll(): Promise<CustomerDTO[]> {
    const customers = await this.repository!.find();
    return customers.map((custumer) => ({
      id: custumer.id,
      name: custumer.name,
      email: custumer.email,
      cpf: custumer.cpf,
      phone: custumer.phone,
    }));
  }

  async findById(id: number): Promise<CustomerDTO | null> {
    const custumer = await this.repository!.findOne({ where: { id } });
    if (!custumer) {
      return null;
    }
    return {
      id: custumer.id,
      name: custumer.name,
      email: custumer.email,
      cpf: custumer.cpf,
      phone: custumer.phone,
    };
  }

  async save(customer: Customer): Promise<CustomerDTO> {
    const custumerEntity = new CustumerEntity();
    custumerEntity.name = customer.name;
    custumerEntity.email = customer.email;
    custumerEntity.cpf = customer.cpf;
    custumerEntity.phone = customer.phone ?? null;

    const savedCustumer = await this.repository!.save(custumerEntity);

    return {
      id: savedCustumer.id,
      name: savedCustumer.name,
      email: savedCustumer.email,
      cpf: savedCustumer.cpf,
      phone: savedCustumer.phone,
    };
  }

  async update(customer: Customer): Promise<CustomerDTO | null> {
    if (customer.id === null) {
      throw new Error("Cannot update customer without ID");
    }

    const existingCustumer = await this.repository!.findOne({
      where: { id: customer.id },
    });

    if (!existingCustumer) {
      return null;
    }

    existingCustumer.name = customer.name;
    existingCustumer.email = customer.email;
    existingCustumer.cpf = customer.cpf;
    existingCustumer.phone = customer.phone ?? null;

    const updatedCustumer = await this.repository!.save(existingCustumer);

    return {
      id: updatedCustumer.id,
      name: updatedCustumer.name,
      email: updatedCustumer.email,
      cpf: updatedCustumer.cpf,
      phone: updatedCustumer.phone,
    };
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.repository!.delete(id);
    return result.affected !== undefined && result.affected > 0;
  }
}
