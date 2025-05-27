import { Request, Response } from 'express';
import { ClienteUseCase } from '../../domain/ports/in/ClienteUseCase';

export class ClienteController {
  constructor(private clienteUseCase: ClienteUseCase) {}

  async validarIdentificacao(req: Request, res: Response): Promise<void> {
    try {
      const { id_sessao, tipo_identificacao, valor_identificacao } = req.body;
      // TODO: Validate id_sessao if necessary
      if (!tipo_identificacao || !valor_identificacao) {
          res.status(400).json({ message: 'Tipo e valor de identificação são obrigatórios.' });
          return;
      }
      const resultado = await this.clienteUseCase.validarIdentificacao(tipo_identificacao, valor_identificacao);
      res.status(200).json(resultado);
    } catch (error) {
      console.error('Erro ao validar identificação:', error);
      res.status(500).json({ code: 500, message: 'Erro interno do servidor' });
    }
  }

  async buscarCliente(req: Request, res: Response): Promise<void> {
    try {
      const { id_sessao, tipo_identificacao, valor_identificacao } = req.query;
      // TODO: Validate id_sessao if necessary
      if (!tipo_identificacao || !valor_identificacao) {
        res.status(400).json({ message: 'Tipo e valor de identificação são obrigatórios.' });
        return;
      }
      const resultado = await this.clienteUseCase.buscarCliente(String(tipo_identificacao), String(valor_identificacao));
      if (resultado.status === 'erro') {
          // Handle specific error case from service if needed, e.g., invalid type
          res.status(400).json({ message: 'Tipo de identificação inválido.' });
          return;
      }
      res.status(200).json(resultado);
    } catch (error) {
      console.error('Erro ao buscar cliente:', error);
      res.status(500).json({ code: 500, message: 'Erro interno do servidor' });
    }
  }

  async cadastrarCliente(req: Request, res: Response): Promise<void> {
    try {
      const { id_sessao, nome, email, cpf, telefone, data_nascimento } = req.body;
      // TODO: Validate id_sessao if necessary
      if (!nome || !email || !cpf) {
          res.status(400).json({ message: 'Nome, email e CPF são obrigatórios.' });
          return;
      }
      // Basic validation - enhance as needed
      const dataNascimentoDate = data_nascimento ? new Date(data_nascimento) : undefined;
      if (data_nascimento && isNaN(dataNascimentoDate.getTime())) {
          res.status(400).json({ message: 'Data de nascimento inválida.' });
          return;
      }

      const resultado = await this.clienteUseCase.cadastrarCliente(nome, email, cpf, telefone, dataNascimentoDate);
      if (resultado.status === 'erro') {
          res.status(400).json({ message: resultado.mensagem }); // Return specific error message from service
          return;
      }
      res.status(200).json(resultado);
    } catch (error) {
      console.error('Erro ao cadastrar cliente:', error);
      res.status(500).json({ code: 500, message: 'Erro interno do servidor' });
    }
  }
}

