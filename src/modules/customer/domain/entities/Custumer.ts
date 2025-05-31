import { CustomerValidations } from "../validations/CustomerValidations";

/**
 * Customer Entity
 *
 * This is a domain entity that represents a customer in our system.
 * It contains the core business logic and validation rules for customers.
 */
export class Customer {
  private _id: number | null;
  private _name: string;
  private _email: string;
  private _cpf: string;
  private _phone?: string | null;

  constructor(
    id: number | null,
    name: string,
    email: string,
    cpf: string,
    phone?: string | null
  ) {
    // Validate inputs using domain validations
    if (!CustomerValidations.validateName(name)) {
      throw new Error("Customer name cannot be empty");
    }
    if (!CustomerValidations.validateEmail(email)) {
      throw new Error("Invalid email format");
    }
    if (!CustomerValidations.validateCPF(cpf)) {
      throw new Error("Invalid CPF format");
    }
    if (phone && !CustomerValidations.validatePhone(phone)) {
      throw new Error("Invalid phone format");
    }

    this._id = id;
    this._name = name;
    this._email = email;
    this._cpf = cpf;
    this._phone = phone ?? null;
  }

  // Getters
  get id(): number | null {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  get email(): string {
    return this._email;
  }

  get cpf(): string {
    return this._cpf;
  }

  get phone(): string | null | undefined {
    return this._phone;
  }

  // Business methods
  updateName(name: string): void {
    if (!CustomerValidations.validateName(name)) {
      throw new Error("Customer name cannot be empty");
    }
    this._name = name;
  }

  updateEmail(email: string): void {
    if (!CustomerValidations.validateEmail(email)) {
      throw new Error("Invalid email format");
    }
    this._email = email;
  }

  updateCpf(cpf: string): void {
    if (!CustomerValidations.validateCPF(cpf)) {
      throw new Error("Invalid CPF format");
    }
    this._cpf = cpf;
  }

  updatePhone(phone?: string | null): void {
    if (phone && !CustomerValidations.validatePhone(phone)) {
      throw new Error("Invalid phone format");
    }
    this._phone = phone ?? null;
  }

  // Convert to data transfer object
  toDTO(): CustomerDTO {
    return {
      id: this._id,
      name: this._name,
      email: this._email,
      cpf: this._cpf,
      phone: this._phone,
    };
  }

  // Create from data transfer object
  static fromDTO(dto: CustomerDTO): Customer {
    return new Customer(dto.id, dto.name, dto.email, dto.cpf, dto.phone);
  }
}

// Data Transfer Object interface
export interface CustomerDTO {
  id: number | null;
  name: string;
  email: string;
  cpf: string;
  phone?: string | null;
}
