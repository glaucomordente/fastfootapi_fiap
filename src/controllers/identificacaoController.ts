import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { IdentificacaoService } from '../modules/identificacao/application/services/IdentificacaoService';
import { IdentificacaoValidationRequest } from '../modules/identificacao/domain/models/IdentificacaoValidationRequest';
// IdentificacaoValidationResponse is used by the service, not directly here for response typing from service
// import { IdentificacaoValidationResponse } from '../modules/identificacao/domain/models/IdentificacaoValidationResponse';
import { Cliente } from '../modules/identificacao/domain/models/Cliente';

import { CadastroService } from '../modules/identificacao/application/services/CadastroService';
import { CadastroRequest } from '../modules/identificacao/domain/models/CadastroRequest';
// CadastroResponse is used by the service, not directly here for response typing from service
// import { CadastroResponse } from '../modules/identificacao/domain/models/CadastroResponse';


export class IdentificacaoController {
  private identificacaoService: IdentificacaoService;
  private cadastroService: CadastroService;

  constructor() {
    this.identificacaoService = new IdentificacaoService();
    this.cadastroService = new CadastroService();
  }

  public async getAcessoSistema(req: Request, res: Response): Promise<Response> {
    try {
      const id_sessao = uuidv4();
      const timestamp = new Date().toISOString();

      return res.status(200).json({
        status: "ativo",
        mensagem: "Bem-vindo ao sistema FastFoodAPI!",
        timestamp: timestamp,
        id_sessao: id_sessao,
      });
    } catch (error) {
      console.error("Error in getAcessoSistema:", error);
      return res.status(500).json({
        status: "erro",
        mensagem: "Ocorreu um erro ao processar a solicitação de acesso.",
        detalhe: error instanceof Error ? error.message : "Erro desconhecido",
      });
    }
  }

  public async postValidaIdentificacao(req: Request, res: Response): Promise<Response> {
    try {
      const { id_sessao, tipo_identificacao, valor_identificacao } = req.body as IdentificacaoValidationRequest;

      if (!id_sessao || !tipo_identificacao || !valor_identificacao) {
        return res.status(400).json({
          status: "erro",
          mensagem: "Campos obrigatórios ausentes: id_sessao, tipo_identificacao, valor_identificacao.",
        });
      }

      const validationData: IdentificacaoValidationRequest = {
        id_sessao,
        tipo_identificacao,
        valor_identificacao,
      };

      const serviceResponse = await this.identificacaoService.validarIdentificacao(validationData);
      
      if (serviceResponse.status === 'invalido') {
        return res.status(400).json(serviceResponse);
      }
      return res.status(200).json(serviceResponse);

    } catch (error) {
      console.error("Error in postValidaIdentificacao:", error);
      return res.status(500).json({
        status: "erro",
        mensagem: "Ocorreu um erro ao processar a validação da identificação.",
        detalhe: error instanceof Error ? error.message : "Erro desconhecido",
      });
    }
  }

  public async getBuscaIdentificacao(req: Request, res: Response): Promise<Response> {
    try {
      const id_sessao = req.query.id_sessao as string;
      const tipo_identificacao = req.query.tipo_identificacao as string;
      const valor_identificacao = req.query.valor_identificacao as string;

      if (!id_sessao || !tipo_identificacao || !valor_identificacao) {
        return res.status(400).json({
          status: "erro",
          mensagem: "Parâmetros de consulta obrigatórios ausentes: id_sessao, tipo_identificacao, valor_identificacao.",
        });
      }

      const serviceResponse = await this.identificacaoService.buscarIdentificacao(
        tipo_identificacao,
        valor_identificacao,
        id_sessao
      );

      return res.status(200).json(serviceResponse);

    } catch (error) {
      console.error("Error in getBuscaIdentificacao:", error);
      return res.status(500).json({
        status: "erro",
        mensagem: "Ocorreu um erro ao processar a busca da identificação.",
        detalhe: error instanceof Error ? error.message : "Erro desconhecido",
      });
    }
  }

  public async postInsereDadosCadastro(req: Request, res: Response): Promise<Response> {
    try {
      const { 
        id_sessao, 
        nome, 
        email, 
        cpf, 
        data_nascimento, 
        telefone 
      } = req.body as CadastroRequest;

      if (!id_sessao || !nome || !email || !cpf || !data_nascimento) {
        return res.status(400).json({
          status: "erro",
          mensagem: "Campos obrigatórios ausentes: id_sessao, nome, email, cpf, data_nascimento.",
        });
      }
      
      const cadastroData: CadastroRequest = {
        id_sessao,
        nome,
        email,
        cpf,
        data_nascimento,
        telefone, // Will be undefined if not provided, which is fine
      };

      const serviceResponse = await this.cadastroService.inserirDadosCadastro(cadastroData);
      
      if (serviceResponse.status === 'erro') {
        // Considering service 'erro' as a client-side error for now (e.g., validation like duplicate CPF)
        // If it were a server-side error in the service, 500 might be more appropriate.
        return res.status(400).json(serviceResponse);
      }
      
      // On 'sucesso'
      return res.status(200).json(serviceResponse);

    } catch (error) {
      console.error("Error in postInsereDadosCadastro:", error);
      return res.status(500).json({
        status: "erro",
        mensagem: "Ocorreu um erro ao processar o cadastro.",
        detalhe: error instanceof Error ? error.message : "Erro desconhecido",
      });
    }
  }
}
