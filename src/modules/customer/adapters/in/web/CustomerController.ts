import { Request, Response } from "express";
import { getDataSource } from "../../../../../lib/typeorm";
import { CustomerEntity } from "../../out/persistence/entities/Customer.entity";
import { OrderEntity } from "../../../../orders/adapters/out/persistence/entities/Order.entity";
import { QueryFailedError } from "typeorm";
import { validate } from "class-validator";

/**
 * CustomerController
 *
 * This controller serves as an input adapter for the web interface.
 * It translates HTTP requests into calls to the CustomerUseCase (input port).
 */
export class CustomerController {
  /**
   * Get all customers
   */
  getAllCustomers = async (req: Request, res: Response) => {
    try {
      const dataSource = await getDataSource();
      const customerRepository = dataSource.getRepository(CustomerEntity);
      const customers = await customerRepository.find();
      res.status(200).json(customers);
    } catch (error) {
      console.error("Error fetching customers:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };

  /**
   * Get a customer by ID
   */
  getCustomerById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const dataSource = await getDataSource();
      const customerRepository = dataSource.getRepository(CustomerEntity);
      const customer = await customerRepository.findOne({
        where: { id: Number(id) },
      });

      if (!customer) {
        res.status(404).json({ error: "Customer not found" });
        return;
      }

      res.status(200).json(customer);
    } catch (error) {
      console.error("Error fetching customer:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };

  /**
   * Create a new customer
   */
  createCustomer = async (req: Request, res: Response) => {
    try {
      const { name, email, cpf, phone } = req.body;

      if (!name || !email || !cpf) {
        res.status(400).json({ error: "Name, email, and CPF are required" });
        return;
      }

      const dataSource = await getDataSource();
      const customerRepository = dataSource.getRepository(CustomerEntity);

      // Create customer instance
      const newCustomer = customerRepository.create({
        name,
        email,
        cpf,
        phone: phone ?? null,
      });

      // Validate using class-validator
      const errors = await validate(newCustomer);
      if (errors.length > 0) {
        const validationErrors = errors.reduce((acc, err) => {
          return { ...acc, ...err.constraints };
        }, {});
        res.status(400).json({ errors: validationErrors });
        return;
      }

      // Check if email already exists
      const existingEmail = await customerRepository.findOne({
        where: { email },
      });

      if (existingEmail) {
        res.status(400).json({ error: "Email already registered" });
        return;
      }

      // Check if CPF already exists
      const existingCPF = await customerRepository.findOne({
        where: { cpf },
      });

      if (existingCPF) {
        res.status(400).json({ error: "CPF already registered" });
        return;
      }

      const savedCustomer = await customerRepository.save(newCustomer);
      res.status(201).json(savedCustomer);
    } catch (error) {
      console.error("Error creating customer:", error);
      if (error instanceof QueryFailedError) {
        // Check for unique constraint violation
        if (error.message.includes("duplicate key")) {
          if (error.message.includes("email")) {
            res.status(400).json({ error: "Email already registered" });
            return;
          }
          if (error.message.includes("cpf")) {
            res.status(400).json({ error: "CPF already registered" });
            return;
          }
        }
      }
      res.status(500).json({ error: "Internal server error" });
    }
  };

  /**
   * Update an existing customer
   */
  updateCustomer = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { name, email, cpf, phone } = req.body;

      const dataSource = await getDataSource();
      const customerRepository = dataSource.getRepository(CustomerEntity);

      const existingCustomer = await customerRepository.findOne({
        where: { id: Number(id) },
      });

      if (!existingCustomer) {
        res.status(404).json({ error: "Customer not found" });
        return;
      }

      // Update fields
      if (name !== undefined) existingCustomer.name = name;
      if (email !== undefined) existingCustomer.email = email;
      if (cpf !== undefined) existingCustomer.cpf = cpf;
      if (phone !== undefined) existingCustomer.phone = phone;

      // Validate using class-validator
      const errors = await validate(existingCustomer);
      if (errors.length > 0) {
        const validationErrors = errors.reduce((acc, err) => {
          return { ...acc, ...err.constraints };
        }, {});
        res.status(400).json({ errors: validationErrors });
        return;
      }

      // If email is being updated, check if it's already in use by another customer
      if (email && email !== existingCustomer.email) {
        const emailExists = await customerRepository.findOne({
          where: { email },
        });
        if (emailExists) {
          res.status(400).json({ error: "Email already registered" });
          return;
        }
      }

      // If CPF is being updated, check if it's already in use by another customer
      if (cpf && cpf !== existingCustomer.cpf) {
        const cpfExists = await customerRepository.findOne({
          where: { cpf },
        });
        if (cpfExists) {
          res.status(400).json({ error: "CPF already registered" });
          return;
        }
      }

      const updatedCustomer = await customerRepository.save(existingCustomer);
      res.status(200).json(updatedCustomer);
    } catch (error) {
      console.error("Error updating customer:", error);
      if (error instanceof QueryFailedError) {
        // Check for unique constraint violation
        if (error.message.includes("duplicate key")) {
          if (error.message.includes("email")) {
            res.status(400).json({ error: "Email already registered" });
            return;
          }
          if (error.message.includes("cpf")) {
            res.status(400).json({ error: "CPF already registered" });
            return;
          }
        }
      }
      res.status(500).json({ error: "Internal server error" });
    }
  };

  /**
   * Delete a customer
   */
  deleteCustomer = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const dataSource = await getDataSource();
      const customerRepository = dataSource.getRepository(CustomerEntity);

      const existingCustomer = await customerRepository.findOne({
        where: { id: Number(id) },
      });

      if (!existingCustomer) {
        res.status(404).json({ error: "Customer not found" });
        return;
      }

      await customerRepository.remove(existingCustomer);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting customer:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };

  /**
   * Get all orders for a specific customer
   */
  getCustomerOrders = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const dataSource = await getDataSource();
      const customerRepository = dataSource.getRepository(CustomerEntity);
      const orderRepository = dataSource.getRepository(OrderEntity);

      // First get the customer to get their name
      const customer = await customerRepository.findOne({
        where: { id: Number(id) },
      });

      if (!customer) {
        res.status(404).json({ error: "Customer not found" });
        return;
      }

      const orders = await orderRepository.find({
        where: { customerId: customer.id },
        relations: ["items", "items.product"],
      });

      res.status(200).json(orders);
    } catch (error) {
      console.error("Error fetching customer orders:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };

  /**
   * Get a customer by email or CPF
   */
  getCustomer = async (req: Request, res: Response) => {
    try {
      const { email, cpf } = req.query;
      const dataSource = await getDataSource();
      const customerRepository = dataSource.getRepository(CustomerEntity);

      if (!email && !cpf) {
        res.status(400).json({ error: "Email or CPF is required" });
        return;
      }

      const whereClause: any = {};
      if (email) whereClause.email = email;
      if (cpf) whereClause.cpf = cpf;

      const customer = await customerRepository.findOne({
        where: whereClause,
      });

      if (!customer) {
        res.status(404).json({ error: "Customer not found" });
        return;
      }

      res.status(200).json(customer);
    } catch (error) {
      console.error("Error fetching customer:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };

  /**
   * Get a customer by CPF
   */
  getCustomerByCpf = async (req: Request, res: Response) => {
    try {
      const { cpf } = req.params;
      const dataSource = await getDataSource();
      const customerRepository = dataSource.getRepository(CustomerEntity);
      const customer = await customerRepository.findOne({
        where: { cpf },
      });

      if (!customer) {
        res.status(404).json({ error: "Customer not found" });
        return;
      }

      res.status(200).json(customer);
    } catch (error) {
      console.error("Error fetching customer:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };
}
