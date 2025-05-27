export interface Cliente {
  id: string; // UUID
  nome: string;
  email: string;
  cpf: string;
  telefone: string;
  ultimo_pedido?: string; // datetime, optional
}
