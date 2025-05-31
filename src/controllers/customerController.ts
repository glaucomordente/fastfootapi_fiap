import { Request, Response } from "express";
import { getDataSource } from "../lib/typeorm";
import { CustumerEntity } from "../modules/customer/adapters/out/persistence/entities/Customer.entity";
import { OrderEntity } from "../modules/orders/adapters/out/persistence/entities/Order.entity";
import { QueryFailedError } from "typeorm";
import { validate } from "class-validator";

/**
 * Get all customers
 */
export const getAllCustomers = async (req: Request, res: Response) => {
  try {
    const dataSource = await getDataSource();
    const customerRepository = dataSource.getRepository(CustumerEntity);
    const customers = await customerRepository.find();
    return res.status(200).json(customers);
  } catch (error) {
    console.error("Error fetching customers:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Get a customer by ID
 */
export const getCustomerById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const dataSource = await getDataSource();
    const customerRepository = dataSource.getRepository(CustumerEntity);
    const customer = await customerRepository.findOne({
      where: { id: Number(id) },
    });

    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    return res.status(200).json(customer);
  } catch (error) {
    console.error("Error fetching customer:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Create a new customer
 */
export const createCustomer = async (req: Request, res: Response) => {
  try {
    const { name, email, cpf, phone } = req.body;

    if (!name || !email || !cpf) {
      return res
        .status(400)
        .json({ error: "Name, email, and CPF are required" });
    }

    const dataSource = await getDataSource();
    const customerRepository = dataSource.getRepository(CustumerEntity);

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
      return res.status(400).json({ errors: validationErrors });
    }

    // Check if email already exists
    const existingEmail = await customerRepository.findOne({
      where: { email },
    });

    if (existingEmail) {
      return res.status(400).json({ error: "Email already registered" });
    }

    // Check if CPF already exists
    const existingCPF = await customerRepository.findOne({
      where: { cpf },
    });

    if (existingCPF) {
      return res.status(400).json({ error: "CPF already registered" });
    }

    const savedCustomer = await customerRepository.save(newCustomer);
    return res.status(201).json(savedCustomer);
  } catch (error) {
    console.error("Error creating customer:", error);
    if (error instanceof QueryFailedError) {
      // Check for unique constraint violation
      if (error.message.includes("duplicate key")) {
        if (error.message.includes("email")) {
          return res.status(400).json({ error: "Email already registered" });
        }
        if (error.message.includes("cpf")) {
          return res.status(400).json({ error: "CPF already registered" });
        }
      }
    }
    return res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Update an existing customer
 */
export const updateCustomer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email, cpf, phone } = req.body;

    const dataSource = await getDataSource();
    const customerRepository = dataSource.getRepository(CustumerEntity);

    const existingCustomer = await customerRepository.findOne({
      where: { id: Number(id) },
    });

    if (!existingCustomer) {
      return res.status(404).json({ error: "Customer not found" });
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
      return res.status(400).json({ errors: validationErrors });
    }

    // If email is being updated, check if it's already in use by another customer
    if (email && email !== existingCustomer.email) {
      const emailExists = await customerRepository.findOne({
        where: { email },
      });
      if (emailExists) {
        return res.status(400).json({ error: "Email already registered" });
      }
    }

    // If CPF is being updated, check if it's already in use by another customer
    if (cpf && cpf !== existingCustomer.cpf) {
      const cpfExists = await customerRepository.findOne({
        where: { cpf },
      });
      if (cpfExists) {
        return res.status(400).json({ error: "CPF already registered" });
      }
    }

    const updatedCustomer = await customerRepository.save(existingCustomer);
    return res.status(200).json(updatedCustomer);
  } catch (error) {
    console.error("Error updating customer:", error);
    if (error instanceof QueryFailedError) {
      // Check for unique constraint violation
      if (error.message.includes("duplicate key")) {
        if (error.message.includes("email")) {
          return res.status(400).json({ error: "Email already registered" });
        }
        if (error.message.includes("cpf")) {
          return res.status(400).json({ error: "CPF already registered" });
        }
      }
    }
    return res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Delete a customer
 */
export const deleteCustomer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const dataSource = await getDataSource();
    const customerRepository = dataSource.getRepository(CustumerEntity);

    const existingCustomer = await customerRepository.findOne({
      where: { id: Number(id) },
    });

    if (!existingCustomer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    await customerRepository.remove(existingCustomer);
    return res.status(204).send();
  } catch (error) {
    console.error("Error deleting customer:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Get all orders for a specific customer
 */
export const getCustomerOrders = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const dataSource = await getDataSource();
    const customerRepository = dataSource.getRepository(CustumerEntity);
    const orderRepository = dataSource.getRepository(OrderEntity);

    // First get the customer to get their name
    const customer = await customerRepository.findOne({
      where: { id: Number(id) },
    });

    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    const orders = await orderRepository.find({
      where: { customerName: customer.name },
      relations: ["items", "items.product"],
      order: { createdAt: "DESC" },
    });

    return res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching customer orders:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Get a customer by email or CPF
 */
export const getCustomer = async (req: Request, res: Response) => {
  try {
    const { email, cpf } = req.query;
    const dataSource = await getDataSource();
    const customerRepository = dataSource.getRepository(CustumerEntity);

    if (!email && !cpf) {
      return res.status(400).json({ error: "Email or CPF is required" });
    }

    const whereClause: any = {};
    if (email) whereClause.email = email;
    if (cpf) whereClause.cpf = cpf;

    const customer = await customerRepository.findOne({
      where: whereClause,
    });

    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    return res.status(200).json(customer);
  } catch (error) {
    console.error("Error fetching customer:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

