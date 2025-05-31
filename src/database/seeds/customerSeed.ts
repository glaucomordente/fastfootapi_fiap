import { CustomerEntity } from "../../modules/customer/adapters/out/persistence/entities/Customer.entity";
import { getDataSource } from "../../lib/typeorm";

/**
 * Seed initial customers into the database
 */
export async function seedCustomers() {
  const dataSource = await getDataSource();
  const customerRepository = dataSource.getRepository(CustomerEntity);

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
      email: "joao.silva@email.com",
      cpf: "12345678900",
      phone: "11999999999"
    },
    {
      name: "Maria Santos",
      email: "maria.santos@email.com",
      cpf: "98765432100",
      phone: "11988888888"
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

  for (const customer of customers) {
    const existingCustomer = await customerRepository.findOne({
      where: [
        { email: customer.email },
        { cpf: customer.cpf }
      ]
    });

    if (!existingCustomer) {
      const newCustomer = customerRepository.create(customer);
      await customerRepository.save(newCustomer);
    }
  }

  console.log(`Seeded ${customers.length} customers successfully`);
}
