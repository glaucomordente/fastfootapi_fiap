import { IdentificacaoValidationRequest } from '../../domain/models/IdentificacaoValidationRequest';
import { IdentificacaoValidationResponse } from '../../domain/models/IdentificacaoValidationResponse';
import { Cliente } from '../../domain/models/Cliente';
import { ClienteEntity } from '../../adapters/out/persistence/entities/Cliente.entity'; // For future use
// import { getDataSource } from '../../../../lib/typeorm'; // For future use
import { v4 as uuidv4 } from 'uuid'; // For generating mock ID

export class IdentificacaoService {
  public async validarIdentificacao(data: IdentificacaoValidationRequest): Promise<IdentificacaoValidationResponse> {
    const timestamp = new Date().toISOString();
    // Simulate logging or use of id_sessao
    console.log(`Validating identification for session: ${data.id_sessao}`);

    if (data.tipo_identificacao === 'cpf') {
      if (!/^\d{11}$/.test(data.valor_identificacao)) {
        return {
          status: 'invalido',
          mensagem: 'CPF inválido. Deve conter 11 dígitos numéricos.',
          timestamp: timestamp,
        };
      }
    } else if (data.tipo_identificacao === 'email') {
      if (!data.valor_identificacao.includes('@')) {
        return {
          status: 'invalido',
          mensagem: 'Email inválido. Deve conter o caractere "@".',
          timestamp: timestamp,
        };
      }
    }

    // If specific checks pass or type is not 'cpf' or 'email', consider it valid for this simulation
    return {
      status: 'valido',
      mensagem: 'Identificação validada com sucesso.',
      timestamp: timestamp,
    };
  }

  public async buscarIdentificacao(
    tipo_identificacao: string,
    valor_identificacao: string,
    id_sessao: string // Included for completeness, though not used in mock
  ): Promise<{ status: string; cliente?: Cliente; timestamp: string; mensagem?: string }> {
    const timestamp = new Date().toISOString();
    console.log(`Searching identification for session: ${id_sessao}, type: ${tipo_identificacao}, value: ${valor_identificacao}`);

    // Mocked database interaction
    const mockCpf = '12345678900';
    const mockEmail = 'mock@example.com';

    let foundCliente: Cliente | undefined = undefined;

    if (tipo_identificacao === 'cpf' && valor_identificacao === mockCpf) {
      foundCliente = {
        id: uuidv4(),
        nome: 'Mock Cliente CPF',
        email: 'mockcpf@example.com',
        cpf: mockCpf,
        telefone: '11999998800',
        ultimo_pedido: new Date(Date.now() - 86400000 * 5).toISOString(), // 5 days ago
      };
    } else if (tipo_identificacao === 'email' && valor_identificacao === mockEmail) {
      foundCliente = {
        id: uuidv4(),
        nome: 'Mock Cliente Email',
        email: mockEmail,
        cpf: '00987654321',
        telefone: '11999998811',
        ultimo_pedido: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
      };
    }

    if (foundCliente) {
      return {
        status: 'encontrado',
        cliente: foundCliente,
        timestamp: timestamp,
      };
    } else {
      return {
        status: 'nao_encontrado',
        mensagem: 'Cliente não encontrado.',
        timestamp: timestamp,
      };
    }
  }
}
