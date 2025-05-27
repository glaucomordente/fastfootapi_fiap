export class Cliente {
  constructor(
    public readonly id: string, // UUID
    public nome: string,
    public email: string,
    public cpf: string,
    public telefone?: string, // Opcional conforme contrato de busca, mas presente no cadastro
    public dataNascimento?: Date, // Opcional, presente apenas no cadastro
    public ultimoPedido?: Date // Presente apenas na busca
  ) {}

  // Métodos de domínio podem ser adicionados aqui, se necessário
  // Ex: validarCPF(), formatarTelefone(), etc.
}

