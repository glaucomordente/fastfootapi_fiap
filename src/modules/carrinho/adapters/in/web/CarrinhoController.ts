import { Request, Response } from 'express';
import { CarrinhoUseCase } from '../../domain/ports/in/CarrinhoUseCase';
import { AdicionarItemDTO, RemoverItemDTO } from '../../domain/ports/in/CarrinhoUseCase';

export class CarrinhoController {
  constructor(private carrinhoUseCase: CarrinhoUseCase) {}

  /**
   * POST /api/v1/carrinho/adicionar/lanche
   */
  adicionarLanche = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id_sessao, id_produto, quantidade, observacoes } = req.body;

      if (!id_sessao || !id_produto || quantidade === undefined) {
        res.status(400).json({ message: 'id_sessao, id_produto e quantidade são obrigatórios.' });
        return;
      }

      const quantidadeNum = Number(quantidade);
      if (isNaN(quantidadeNum) || quantidadeNum <= 0) {
          res.status(400).json({ message: 'Quantidade inválida.' });
          return;
      }

      const dto: AdicionarItemDTO = {
        id_sessao,
        id_produto,
        quantidade: quantidadeNum,
        observacoes,
      };

      const resultado = await this.carrinhoUseCase.adicionarItem(dto);

      if (resultado.status === 'erro') {
          // Determine appropriate status code based on error message if possible
          res.status(400).json(resultado); // Or 404 if product not found
      } else {
          res.status(200).json(resultado);
      }
    } catch (error) {
      console.error('Erro ao adicionar item ao carrinho:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  };

  /**
   * POST /api/v1/carrinho/confirmar
   */
  confirmarCarrinho = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id_sessao } = req.body;

      if (!id_sessao) {
        res.status(400).json({ message: 'id_sessao é obrigatório.' });
        return;
      }

      const resultado = await this.carrinhoUseCase.confirmarCarrinho(id_sessao);

       if (resultado.status === 'erro') {
          res.status(400).json(resultado); // Or 404 if cart not found
      } else {
          res.status(200).json(resultado);
      }
    } catch (error) {
      console.error('Erro ao confirmar carrinho:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  };

  /**
   * GET /api/v1/carrinho/visualizar
   */
  visualizarCarrinho = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id_sessao } = req.query;

      if (!id_sessao) {
        // Contract implies 200 OK even if session is missing, returning empty cart
         res.status(200).json({
           itens: [],
           subtotal: 0,
           total: 0,
           timestamp: new Date().toISOString()
         });
        return;
      }

      const resultado = await this.carrinhoUseCase.visualizarCarrinho(String(id_sessao));

      if (!resultado) {
          // Cart for session doesn't exist, return empty cart structure
           res.status(200).json({
               itens: [],
               subtotal: 0,
               total: 0,
               timestamp: new Date().toISOString()
           });
      } else {
          res.status(200).json(resultado);
      }
    } catch (error) {
      console.error('Erro ao visualizar carrinho:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  };

  /**
   * DELETE /api/v1/carrinho/remover
   */
  removerItem = async (req: Request, res: Response): Promise<void> => {
    try {
      // DELETE request might have body or query params depending on convention
      // Assuming body for consistency with contract example
      const { id_sessao, id_item_carrinho } = req.body;

      if (!id_sessao || !id_item_carrinho) {
        res.status(400).json({ message: 'id_sessao e id_item_carrinho são obrigatórios.' });
        return;
      }

      const dto: RemoverItemDTO = { id_sessao, id_item_carrinho };
      const resultado = await this.carrinhoUseCase.removerItem(dto);

      if (resultado.status === 'erro') {
          res.status(400).json(resultado); // Or 404 if cart/item not found
      } else {
          res.status(200).json(resultado);
      }
    } catch (error) {
      console.error('Erro ao remover item do carrinho:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  };
}

