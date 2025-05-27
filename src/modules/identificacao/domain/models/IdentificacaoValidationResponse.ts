export interface IdentificacaoValidationResponse {
  status: 'valido' | 'invalido' | string;
  mensagem: string;
  timestamp: string;
}
