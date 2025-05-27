import { Cliente } from "../../domain/entities/Cliente";

export interface ClienteUseCase {
  validarIdentificacao(tipo: string, valor: string): Promise<{ status: string; mensagem: string; timestamp: string }>;
  buscarCliente(tipo: string, valor: string): Promise<{ status: string; cliente: Cliente | null; timestamp: string }>;
  cadastrarCliente(nome: string, email: string, cpf: string, telefone?: string, dataNascimento?: Date): Promise<{ status: string; mensagem: string; id_cliente: string; timestamp: string }>;
}

