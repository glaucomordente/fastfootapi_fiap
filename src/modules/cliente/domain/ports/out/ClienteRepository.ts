import { Cliente } from "../../domain/entities/Cliente";

export interface ClienteRepository {
  findByCpf(cpf: string): Promise<Cliente | null>;
  findByEmail(email: string): Promise<Cliente | null>;
  findById(id: string): Promise<Cliente | null>;
  save(cliente: Cliente): Promise<Cliente>;
  // Outros métodos podem ser necessários, como update, delete, etc.
}

