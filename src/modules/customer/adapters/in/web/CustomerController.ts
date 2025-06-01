import { Request, Response } from "express";
import { CustomerUseCase } from "../../../domain/ports/in/CustomerUseCase";
import { getDataSource } from "../../../../../lib/typeorm";
import { CustomerEntity } from "../../../adapters/out/persistence/entities/Customer.entity";
import { OrderEntity } from "../../../../orders/adapters/out/persistence/entities/Order.entity";

/**
 * CustomerController
 *
 * This controller serves as an input adapter for the web interface.
 * It translates HTTP requests into calls to the CustomerUseCase (input port).
 */
export class CustomerController {
  private customerUseCase: CustomerUseCase;

  constructor(customerUseCase: CustomerUseCase) {
    this.customerUseCase = customerUseCase;
  }

  /**
   * Get all customers
   */
  async getAllCustomers(req: Request, res: Response): Promise<void> {
    try {
      const customers = await this.customerUseCase.getAllCustomers();
      res.json(customers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch customers" });
    }
  }

  /**
   * Get a customer by ID
   */
  async getCustomerById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const customer = await this.customerUseCase.getCustomerById(id);
      if (!customer) {
        res.status(404).json({ message: "Cliente não encontrado" });
        return;
      }
      res.json(customer);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  /**
   * Create a new customer
   */
  async createCustomer(req: Request, res: Response): Promise<void> {
    try {
      const customer = await this.customerUseCase.createCustomer(req.body);
      res.status(201).json(customer);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  /**
   * Update an existing customer
   */
  async updateCustomer(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const customer = await this.customerUseCase.updateCustomer(id, req.body);
      if (!customer) {
        res.status(404).json({ message: "Cliente não encontrado" });
        return;
      }
      res.json(customer);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  /**
   * Delete a customer
   */
  async deleteCustomer(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      await this.customerUseCase.deleteCustomer(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async getCustomerOrders(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const dataSource = await getDataSource();
      const customerRepository = dataSource.getRepository(CustomerEntity);

      const customer = await customerRepository.findOne({
        where: { id },
        relations: ['orders', 'orders.items', 'orders.items.product']
      });

      if (!customer) {
        res.status(404).json({ message: "Cliente não encontrado" });
        return;
      }

      res.json(customer.orders);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async getCustomer(req: Request, res: Response): Promise<void> {
    try {
      const { cpf, email } = req.query;

      if (!cpf && !email) {
        res.status(400).json({ error: "Either CPF or email must be provided" });
        return;
      }

      const dataSource = await getDataSource();
      const customerRepository = dataSource.getRepository(CustomerEntity);

      let customer: CustomerEntity | null = null;

      if (cpf) {
        customer = await customerRepository.findOne({
          where: { cpf: cpf as string },
        });
      } else if (email) {
        customer = await customerRepository.findOne({
          where: { email: email as string },
        });
      }

      if (customer) {
        res.json(customer);
      } else {
        res.status(404).json({ error: "Customer not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch customer" });
    }
  }

  async getCustomerByCpf(req: Request, res: Response): Promise<void> {
    try {
      const cpf = req.params.cpf;
      const dataSource = await getDataSource();
      const customerRepository = dataSource.getRepository(CustomerEntity);
      const customer = await customerRepository.findOne({ where: { cpf } });
      
      if (!customer) {
        res.status(404).json({ message: "Cliente não encontrado" });
        return;
      }
      
      res.json(customer);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}
