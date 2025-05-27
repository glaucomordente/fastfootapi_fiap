import { SistemaUseCase } from '../domain/ports/in/SistemaUseCase';
import { v4 as uuidv4 } from 'uuid';

export class SistemaService implements SistemaUseCase {
  async getAcesso(): Promise<{ status: string; mensagem: string; timestamp: string; id_sessao: string }> {
    // Simula a obtenção do status do sistema (poderia vir de uma config ou DB)
    const statusSistema = 'ativo'; // ou 'manutencao'
    const mensagemBoasVindas = 'Bem-vindo à FastFoodAPI!';
    const timestamp = new Date().toISOString();
    const idSessao = uuidv4();

    return {
      status: statusSistema,
      mensagem: mensagemBoasVindas,
      timestamp: timestamp,
      id_sessao: idSessao,
    };
  }
}

