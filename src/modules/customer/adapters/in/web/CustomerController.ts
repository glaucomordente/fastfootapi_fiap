import { Request, Response } from "express";
import { CustomerUseCase } from "../../../domain/ports/in/CustomerUseCase";
import { Customer, CustomerDTO } from "../../../domain/entities/Customer";

/**
 * @swagger
 * components:
 *   schemas:
 *     Customer:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - cpf
 *       properties:
 *         id:
 *           type: integer
 *           description: The customer ID
 *         name:
 *           type: string
 *           description: The customer name
 *         email:
 *           type: string
 *           format: email
 *           description: The customer email
 *         cpf:
 *           type: string
 *           description: The customer CPF (Brazilian ID)
 *         phone:
 *           type: string
 *           description: The customer phone number
 *       example:
 *         id: 1
 *         name: John Doe
 *         email: john@example.com
 *         cpf: 12345678900
 *         phone: +5511987654321
 */

/**
 * CustomerController
 * 
 * This controller handles HTTP requests related to customers.
 * It follows the hexagonal architecture pattern as an input adapter.
 */
export class CustomerController {
  constructor(private customerUseCase: CustomerUseCase) {}

  /**
   * @swagger
   * /customers:
   *   get:
   *     summary: Returns all customers
   *     tags: [Customers]
   *     responses:
   *       200:
   *         description: The list of customers
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/Customer'
   *       500:
   *         description: Internal server error
   */
  async getAllCustomers(req: Request, res: Response): Promise<Response> {
    try {
      const customers = await this.customerUseCase.findAll();
      return res.status(200).json(customers);
    } catch (error) {
      console.error("Error fetching customers:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  /**
   * @swagger
   * /customers/{id}:
   *   get:
   *     summary: Get a customer by id
   *     tags: [Customers]
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: integer
   *         required: true
   *         description: The customer id
   *     responses:
   *       200:
   *         description: The customer
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Customer'
   *       404:
   *         description: Customer not found
   *       500:
   *         description: Internal server error
   */
  async getCustomerById(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const customer = await this.customerUseCase.findById(Number(id));

      if (!customer) {
        return res.status(404).json({ error: "Customer not found" });
      }

      return res.status(200).json(customer);
    } catch (error) {
      console.error("Error fetching customer:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  /**
   * @swagger
   * /customers:
   *   post:
   *     summary: Create a new customer
   *     tags: [Customers]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - name
   *               - email
   *               - cpf
   *             properties:
   *               name:
   *                 type: string
   *                 description: The customer name
   *               email:
   *                 type: string
   *                 format: email
   *                 description: The customer email
   *               cpf:
   *                 type: string
   *                 description: The customer CPF (Brazilian ID)
   *               phone:
   *                 type: string
   *                 description: The customer phone number
   *     responses:
   *       201:
   *         description: The created customer
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Customer'
   *       400:
   *         description: Bad request - missing required fields or validation error
   *       500:
   *         description: Internal server error
   */
  async createCustomer(req: Request, res: Response): Promise<Response> {
    try {
      const { name, email, cpf, phone } = req.body;

      if (!name || !email || !cpf) {
        return res
          .status(400)
          .json({ error: "Name, email, and CPF are required" });
      }

      // Check if email already exists
      const existingEmail = await this.customerUseCase.findByEmail(email);
      if (existingEmail) {
        return res.status(400).json({ error: "Email already registered" });
      }

      // Check if CPF already exists
      const existingCPF = await this.customerUseCase.findByCPF(cpf);
      if (existingCPF) {
        return res.status(400).json({ error: "CPF already registered" });
      }

      // Create customer instance
      const customerData: CustomerDTO = {
        name,
        email,
        cpf,
        phone: phone ?? null
      };
      
      const newCustomer = Customer.fromDTO(customerData);
      const savedCustomer = await this.customerUseCase.save(newCustomer);
      
      return res.status(201).json(savedCustomer);
    } catch (error) {
      console.error("Error creating customer:", error);
      if (error instanceof Error) {
        // Check for validation errors
        if (error.message.includes("name") || 
            error.message.includes("email") || 
            error.message.includes("CPF") || 
            error.message.includes("phone")) {
          return res.status(400).json({ error: error.message });
        }
        
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
  }

  /**
   * @swagger
   * /customers/{id}:
   *   put:
   *     summary: Update a customer
   *     tags: [Customers]
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: integer
   *         required: true
   *         description: The customer id
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               name:
   *                 type: string
   *                 description: The customer name
   *               email:
   *                 type: string
   *                 format: email
   *                 description: The customer email
   *               cpf:
   *                 type: string
   *                 description: The customer CPF (Brazilian ID)
   *               phone:
   *                 type: string
   *                 description: The customer phone number
   *     responses:
   *       200:
   *         description: The updated customer
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Customer'
   *       400:
   *         description: Bad request - validation error
   *       404:
   *         description: Customer not found
   *       500:
   *         description: Internal server error
   */
  async updateCustomer(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const { name, email, cpf, phone } = req.body;

      const existingCustomer = await this.customerUseCase.findById(Number(id));
      if (!existingCustomer) {
        return res.status(404).json({ error: "Customer not found" });
      }

      // If email is being updated, check if it's already in use by another customer
      if (email && email !== existingCustomer.email) {
        const emailExists = await this.customerUseCase.findByEmail(email);
        if (emailExists && emailExists.id !== existingCustomer.id) {
          return res.status(400).json({ error: "Email already registered" });
        }
      }

      // If CPF is being updated, check if it's already in use by another customer
      if (cpf && cpf !== existingCustomer.cpf) {
        const cpfExists = await this.customerUseCase.findByCPF(cpf);
        if (cpfExists && cpfExists.id !== existingCustomer.id) {
          return res.status(400).json({ error: "CPF already registered" });
        }
      }

      // Create a new customer with updated fields
      const customerData: CustomerDTO = {
        id: existingCustomer.id as number,
        name: name || existingCustomer.name,
        email: email || existingCustomer.email,
        cpf: cpf || existingCustomer.cpf,
        phone: phone !== undefined ? phone : existingCustomer.phone
      };
      
      const updatedCustomer = Customer.fromDTO(customerData);
      const savedCustomer = await this.customerUseCase.save(updatedCustomer);
      
      return res.status(200).json(savedCustomer);
    } catch (error) {
      console.error("Error updating customer:", error);
      if (error instanceof Error) {
        // Check for validation errors
        if (error.message.includes("name") || 
            error.message.includes("email") || 
            error.message.includes("CPF") || 
            error.message.includes("phone")) {
          return res.status(400).json({ error: error.message });
        }
        
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
  }

  /**
   * @swagger
   * /customers/{id}:
   *   delete:
   *     summary: Delete a customer
   *     tags: [Customers]
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: integer
   *         required: true
   *         description: The customer id
   *     responses:
   *       204:
   *         description: Customer deleted successfully
   *       404:
   *         description: Customer not found
   *       500:
   *         description: Internal server error
   */
  async deleteCustomer(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const existingCustomer = await this.customerUseCase.findById(Number(id));

      if (!existingCustomer) {
        return res.status(404).json({ error: "Customer not found" });
      }

      await this.customerUseCase.delete(Number(id));
      return res.status(204).send();
    } catch (error) {
      console.error("Error deleting customer:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  /**
   * @swagger
   * /customers/{id}/orders:
   *   get:
   *     summary: Get all orders for a specific customer
   *     tags: [Customers]
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: integer
   *         required: true
   *         description: The customer id
   *     responses:
   *       200:
   *         description: List of customer orders
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 type: object
   *       404:
   *         description: Customer not found
   *       500:
   *         description: Internal server error
   */
  async getCustomerOrders(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const customer = await this.customerUseCase.findById(Number(id));

      if (!customer) {
        return res.status(404).json({ error: "Customer not found" });
      }

      const orders = await this.customerUseCase.getCustomerOrders(Number(id));
      return res.status(200).json(orders);
    } catch (error) {
      console.error("Error fetching customer orders:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  /**
   * @swagger
   * /customers/search:
   *   get:
   *     summary: Get a customer by email or CPF
   *     tags: [Customers]
   *     parameters:
   *       - in: query
   *         name: email
   *         schema:
   *           type: string
   *         description: The customer email
   *       - in: query
   *         name: cpf
   *         schema:
   *           type: string
   *         description: The customer CPF
   *     responses:
   *       200:
   *         description: The customer
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Customer'
   *       400:
   *         description: Bad request - email or CPF is required
   *       404:
   *         description: Customer not found
   *       500:
   *         description: Internal server error
   */
  async getCustomer(req: Request, res: Response): Promise<Response> {
    try {
      const { email, cpf } = req.query;

      if (!email && !cpf) {
        return res.status(400).json({ error: "Email or CPF is required" });
      }

      let customer = null;
      if (email) {
        customer = await this.customerUseCase.findByEmail(email as string);
      } else if (cpf) {
        customer = await this.customerUseCase.findByCPF(cpf as string);
      }

      if (!customer) {
        return res.status(404).json({ error: "Customer not found" });
      }

      return res.status(200).json(customer);
    } catch (error) {
      console.error("Error fetching customer:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
}
