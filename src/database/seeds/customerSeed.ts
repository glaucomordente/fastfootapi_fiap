import { CustumerEntity } from "../../modules/customer/adapters/out/persistence/entities/Customer.entity";
import { DataSource } from "typeorm";

/**
 * Seed initial customers into the database
 * @param dataSource TypeORM DataSource
 */
export const seedCustomers = async (dataSource: DataSource): Promise<void> => {
  const customerRepository = dataSource.getRepository(CustumerEntity);

  // Check if customers already exist
  const count = await customerRepository.count();
  if (count > 0) {
    console.log("Customers already seeded, skipping...");
    return;
  }

  // Initial customers
  const customers = [
    {
      name: "João Silva",
      email: "joao@email.com",
      cpf: "12345678901",
      phone: "11999999999",
    },
    {
      name: "Maria Souza",
      email: "maria@email.com",
      cpf: "98765432100",
      phone: "11988888888",
    },
    {
      name: "Carlos Pereira",
      email: "carlos@email.com",
      cpf: "11122233344",
      phone: null,
    },
    {
      name: "Ana Oliveira",
      email: "ana@email.com",
      cpf: "55566677788",
      phone: "11977777777",
    },
  ];

  // Insert customers
  await customerRepository.insert(customers);
  console.log(`Seeded ${customers.length} customers successfully`);
};
