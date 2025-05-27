import { v4 as uuidv4 } from 'uuid';

export interface SistemaUseCase {
  getAcesso(): Promise<{ status: string; mensagem: string; timestamp: string; id_sessao: string }>;
}

