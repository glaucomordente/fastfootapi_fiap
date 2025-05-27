export interface IdentificacaoValidationRequest {
  id_sessao: string;
  tipo_identificacao: 'cpf' | 'email' | string; // Allow string for flexibility, but specify known types
  valor_identificacao: string;
}
