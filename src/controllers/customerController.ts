import { Request, Response } from "express";
import { getDataSource } from "../lib/typeorm";
import { CustumerEntity } from "../modules/customer/adapters/out/persistence/entities/Customer.entity";

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

    const newCustomer = customerRepository.create({
      name,
      email,
      cpf,
      phone: phone ?? null,
    });

    const savedCustomer = await customerRepository.save(newCustomer);
    return res.status(201).json(savedCustomer);
  } catch (error) {
    console.error("Error creating customer:", error);
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

    const updatedCustomer = await customerRepository.save(existingCustomer);
    return res.status(200).json(updatedCustomer);
  } catch (error) {
    console.error("Error updating customer:", error);
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
