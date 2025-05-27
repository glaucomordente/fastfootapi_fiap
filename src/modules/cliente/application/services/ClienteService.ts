import { ClienteUseCase } from "../domain/ports/in/ClienteUseCase";
import { ClienteRepository } from "../domain/ports/out/ClienteRepository";
import { Cliente } from "../domain/entities/Cliente";
import { v4 as uuidv4 } from 'uuid';

export class ClienteService implements ClienteUseCase {
  constructor(private readonly clienteRepository: ClienteRepository) {}

  async validarIdentificacao(tipo: string, valor: string): Promise<{ status: string; mensagem: string; timestamp: string }> {
    let cliente: Cliente | null = null;
    if (tipo === 'cpf') {
      // Basic CPF validation (length and digits only) - enhance with proper algorithm if needed
      const cpfLimpo = valor.replace(/\D/g, '');
      if (cpfLimpo.length !== 11) {
        return { status: 'invalido', mensagem: 'CPF inválido.', timestamp: new Date().toISOString() };
      }
      cliente = await this.clienteRepository.findByCpf(cpfLimpo);
    } else if (tipo === 'email') {
      // Basic email format validation - enhance with regex if needed
      if (!valor.includes('@')) {
          return { status: 'invalido', mensagem: 'Email inválido.', timestamp: new Date().toISOString() };
      }
      cliente = await this.clienteRepository.findByEmail(valor);
    } else {
      return { status: 'invalido', mensagem: 'Tipo de identificação inválido.', timestamp: new Date().toISOString() };
    }

    const status = cliente ? 'valido' : 'invalido';
    const mensagem = cliente ? 'Cliente identificado com sucesso.' : 'Cliente não encontrado.';

    return { status, mensagem, timestamp: new Date().toISOString() };
  }

  async buscarCliente(tipo: string, valor: string): Promise<{ status: string; cliente: Cliente | null; timestamp: string }> {
    let cliente: Cliente | null = null;
    if (tipo === 'cpf') {
      const cpfLimpo = valor.replace(/\D/g, '');
      cliente = await this.clienteRepository.findByCpf(cpfLimpo);
    } else if (tipo === 'email') {
      cliente = await this.clienteRepository.findByEmail(valor);
    } else {
        return { status: 'erro', cliente: null, timestamp: new Date().toISOString() }; // Indicate error due to invalid type
    }

    const status = cliente ? 'encontrado' : 'nao_encontrado';
    // Ensure only relevant fields are returned as per contract
    const clienteResponse = cliente ? new Cliente(
        cliente.id,
        cliente.nome,
        cliente.email,
        cliente.cpf,
        cliente.telefone,
        undefined, // dataNascimento not in response
        cliente.ultimoPedido // ultimoPedido is in response
    ) : null;


    return { status, cliente: clienteResponse, timestamp: new Date().toISOString() };
  }

  async cadastrarCliente(nome: string, email: string, cpf: string, telefone?: string, dataNascimento?: Date): Promise<{ status: string; mensagem: string; id_cliente: string; timestamp: string }> {
    const cpfLimpo = cpf.replace(/\D/g, '');
    // Check if CPF or Email already exists
    const [clientePorCpf, clientePorEmail] = await Promise.all([
        this.clienteRepository.findByCpf(cpfLimpo),
        this.clienteRepository.findByEmail(email)
    ]);

    if (clientePorCpf) {
      return { status: 'erro', mensagem: 'CPF já cadastrado.', id_cliente: '', timestamp: new Date().toISOString() };
    }
    if (clientePorEmail) {
        return { status: 'erro', mensagem: 'Email já cadastrado.', id_cliente: '', timestamp: new Date().toISOString() };
    }

    const novoClienteId = uuidv4();
    const novoCliente = new Cliente(
      novoClienteId,
      nome,
      email,
      cpfLimpo,
      telefone,
      dataNascimento
    );

    try {
      const clienteSalvo = await this.clienteRepository.save(novoCliente);
      return {
        status: 'sucesso',
        mensagem: 'Cliente cadastrado com sucesso.',
        id_cliente: clienteSalvo.id,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Erro ao salvar cliente:", error);
      return { status: 'erro', mensagem: 'Erro ao cadastrar cliente.', id_cliente: '', timestamp: new Date().toISOString() };
    }
  }
}

