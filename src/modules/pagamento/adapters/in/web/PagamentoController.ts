import { Request, Response } from 'express';
import { PagamentoUseCase, GerarQrCodeDTO, ConfirmarPagamentoDTO, RegistrarPedidoDTO } from '../../domain/ports/in/PagamentoUseCase';

export class PagamentoController {
  constructor(private pagamentoUseCase: PagamentoUseCase) {}

  /**
   * POST /api/v1/pagamento/gerar-qrcode
   */
  gerarQrCode = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id_sessao, valor_total } = req.body;

      if (!id_sessao || valor_total === undefined) {
        res.status(400).json({ message: 'id_sessao e valor_total são obrigatórios.' });
        return;
      }

      const valorNum = Number(valor_total);
      if (isNaN(valorNum) || valorNum <= 0) {
          res.status(400).json({ message: 'Valor total inválido.' });
          return;
      }

      const dto: GerarQrCodeDTO = { id_sessao, valor_total: valorNum };
      const resultado = await this.pagamentoUseCase.gerarQrCodePagamento(dto);

      if (resultado.status === 'erro') {
          // Determine status code based on error type (e.g., 404 for not found, 400 for bad request)
          res.status(400).json(resultado);
      } else {
          res.status(200).json(resultado);
      }
    } catch (error) {
      console.error('Erro ao gerar QR code:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  };

  /**
   * POST /api/v1/pagamento/confirmar (Simulates Webhook)
   */
  confirmarPagamento = async (req: Request, res: Response): Promise<void> => {
    try {
      // Basic validation of webhook payload structure
      const { id_pagamento, status_pagamento, id_transacao_mp, valor_pago, metodo_pagamento } = req.body;

      if (!id_pagamento || !status_pagamento || !id_transacao_mp || valor_pago === undefined || !metodo_pagamento) {
        res.status(400).json({ message: 'Payload de confirmação inválido.' });
        return;
      }
      if (status_pagamento !== 'aprovado' && status_pagamento !== 'recusado') {
          res.status(400).json({ message: 'Status de pagamento inválido (deve ser aprovado ou recusado).' });
          return;
      }
       const valorNum = Number(valor_pago);
      if (isNaN(valorNum) || valorNum <= 0) {
          res.status(400).json({ message: 'Valor pago inválido.' });
          return;
      }

      const dto: ConfirmarPagamentoDTO = {
          id_pagamento,
          status_pagamento,
          id_transacao_mp,
          valor_pago: valorNum,
          metodo_pagamento
      };

      const resultado = await this.pagamentoUseCase.confirmarPagamento(dto);

      if (resultado.status === 'erro') {
          res.status(400).json(resultado); // Or 404 if payment not found
      } else {
          res.status(200).json(resultado);
      }
    } catch (error) {
      console.error('Erro ao confirmar pagamento (webhook):', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  };

  /**
   * POST /api/v1/pagamento/registrar-pedido
   */
  registrarPedido = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id_sessao, id_pagamento, id_cliente } = req.body;

      if (!id_sessao || !id_pagamento) {
        res.status(400).json({ message: 'id_sessao e id_pagamento são obrigatórios.' });
        return;
      }

      const dto: RegistrarPedidoDTO = { id_sessao, id_pagamento, id_cliente };
      const resultado = await this.pagamentoUseCase.registrarPedido(dto);

      if (resultado.status === 'erro') {
          res.status(400).json(resultado); // Or 404, 409 depending on error
      } else {
          res.status(200).json(resultado);
      }
    } catch (error) {
      console.error('Erro ao registrar pedido:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  };

  /**
   * GET /api/v1/pagamento/verificar-timer/:id_pagamento
   */
  verificarTimer = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id_pagamento } = req.params;

      if (!id_pagamento) {
        res.status(400).json({ message: 'id_pagamento é obrigatório na URL.' });
        return;
      }

      const resultado = await this.pagamentoUseCase.verificarTimerPagamento(id_pagamento);
      res.status(200).json(resultado); // Always returns 200 as per contract, status is inside payload

    } catch (error) {
      console.error('Erro ao verificar timer do pagamento:', error);
      // Return expired status on internal error?
      res.status(200).json({
          status: "expirado",
          tempo_restante: 0,
          timestamp: new Date().toISOString()
      });
      // Or return 500?
      // res.status(500).json({ error: 'Erro interno do servidor' });
    }
  };
}

