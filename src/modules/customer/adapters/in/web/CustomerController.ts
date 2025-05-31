import { Request, Response } from "express";
import { CustomerUseCase } from "../../../domain/ports/in/CustumerUseCase";
import { getDataSource } from "../../../../../lib/typeorm";
import { CustumerEntity } from "../../../adapters/out/persistence/entities/Customer.entity";
import { OrderEntity } from "../../../../orders/adapters/out/persistence/entities/Order.entity";

/**
 * CustomerController
 *
 * This controller serves as an input adapter for the web interface.
 * It translates HTTP requests into calls to the CustomerUseCase (input port).
 */
export class CustomerController {
  constructor(private readonly customerUseCase: CustomerUseCase) {}

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
      if (customer) {
        res.json(customer);
      } else {
        res.status(404).json({ error: "Customer not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch customer" });
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
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Failed to create customer" });
      }
    }
  }

  /**
   * Update an existing customer
   */
  async updateCustomer(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const customer = await this.customerUseCase.updateCustomer(id, req.body);
      if (customer) {
        res.json(customer);
      } else {
        res.status(404).json({ error: "Customer not found" });
      }
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Failed to update customer" });
      }
    }
  }

  /**
   * Delete a customer
   */
  async deleteCustomer(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const success = await this.customerUseCase.deleteCustomer(id);
      if (success) {
        res.status(204).send();
      } else {
        res.status(404).json({ error: "Customer not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to delete customer" });
    }
  }

  async getCustomerOrders(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const dataSource = await getDataSource();
      const customerRepository = dataSource.getRepository(CustumerEntity);
      const orderRepository = dataSource.getRepository(OrderEntity);

      const customer = await customerRepository.findOne({ where: { id } });
      if (!customer) {
        res.status(404).json({ error: "Customer not found" });
        return;
      }

      const orders = await orderRepository.find({
        where: { customerName: customer.name },
        relations: ["items", "items.product"],
      });

      res.json(orders);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch customer orders" });
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
      const customerRepository = dataSource.getRepository(CustumerEntity);

      let customer: CustumerEntity | null = null;

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
}
