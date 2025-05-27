export interface CadastroResponse {
  status: 'sucesso' | 'erro' | string;
  mensagem: string;
  id_cliente?: string; // UUID, present on success
  timestamp: string;
}
