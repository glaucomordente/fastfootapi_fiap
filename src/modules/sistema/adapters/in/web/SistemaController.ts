import { Request, Response } from 'express';
import { SistemaUseCase } from '../../domain/ports/in/SistemaUseCase';

export class SistemaController {
  constructor(private sistemaUseCase: SistemaUseCase) {}

  async getAcesso(req: Request, res: Response): Promise<void> {
    try {
      const resultado = await this.sistemaUseCase.getAcesso();
      res.status(200).json(resultado);
    } catch (error) {
      // Em um cenário real, logar o erro
      console.error('Erro ao acessar o sistema:', error);
      res.status(500).json({ code: 500, message: 'Erro interno do servidor' });
    }
  }
}

