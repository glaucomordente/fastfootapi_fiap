import { Request, Response } from "express";
import { CustomerUseCase } from "../../../domain/ports/in/CustumerUseCase";

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
  getAllCustomers = async (req: Request, res: Response) => {
    try {
      const customers = await this.customerUseCase.getAllCustomers();
      return res.status(200).json(customers);
    } catch (error) {
      console.error("Error fetching customers:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  };

  /**
   * Get a customer by ID
   */
  getCustomerById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const customer = await this.customerUseCase.getCustomerById(Number(id));

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
  createCustomer = async (req: Request, res: Response) => {
    try {
      const { name, email, cpf, phone } = req.body;

      if (!name || !email || !cpf) {
        return res
          .status(400)
          .json({ error: "Name, email, and CPF are required" });
      }

      const newCustomer = await this.customerUseCase.createCustomer({
        name,
        email,
        cpf,
        phone,
      });

      return res.status(201).json(newCustomer);
    } catch (error) {
      console.error("Error creating customer:", error);

      if (error instanceof Error) {
        if (
          error.message.includes("Customer name") ||
          error.message.includes("Customer email") ||
          error.message.includes("Customer CPF")
        ) {
          return res.status(400).json({ error: error.message });
        }
      }

      return res.status(500).json({ error: "Internal server error" });
    }
  };

  /**
   * Update an existing customer
   */
  updateCustomer = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { name, email, cpf, phone } = req.body;

      const updatedCustomer = await this.customerUseCase.updateCustomer(
        Number(id),
        { name, email, cpf, phone }
      );

      if (!updatedCustomer) {
        return res.status(404).json({ error: "Customer not found" });
      }

      return res.status(200).json(updatedCustomer);
    } catch (error) {
      console.error("Error updating customer:", error);

      if (error instanceof Error) {
        if (
          error.message.includes("Customer name") ||
          error.message.includes("Customer email") ||
          error.message.includes("Customer CPF")
        ) {
          return res.status(400).json({ error: error.message });
        }
      }

      return res.status(500).json({ error: "Internal server error" });
    }
  };

  /**
   * Delete a customer
   */
  deleteCustomer = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const deleted = await this.customerUseCase.deleteCustomer(Number(id));

      if (!deleted) {
        return res.status(404).json({ error: "Customer not found" });
      }

      return res.status(204).send();
    } catch (error) {
      console.error("Error deleting customer:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  };
}
