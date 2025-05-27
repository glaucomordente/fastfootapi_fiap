export interface CadastroRequest {
  id_sessao: string;
  nome: string;
  email: string;
  cpf: string;
  telefone?: string; // Optional as per spec (max 20 chars)
  data_nascimento: string; // Date (consider validating format)
}
