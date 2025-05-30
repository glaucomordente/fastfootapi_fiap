import { Request, Response } from 'express';
import { CarrinhoService } from '@modules/carrinho/application/services/CarrinhoService';

export class CarrinhoController {
  constructor(private carrinhoService: CarrinhoService) {}

  async adicionarLanche(req: Request, res: Response): Promise<void> {
    try {
      const { id_sessao, id_produto, quantidade, observacoes } = req.body;
      const { item, carrinho } = await this.carrinhoService.adicionarItem(
        id_sessao,
        id_produto,
        Number(quantidade),
        observacoes
      );
      res.status(200).json({
        status: 'sucesso',
        mensagem: 'Item adicionado ao carrinho com sucesso',
        id_item_carrinho: item.id,
        subtotal_carrinho: carrinho.subtotal.toFixed(2)
      });
    } catch (error) {
      res.status(500).json({
        status: 'erro',
        mensagem: error.message || 'Erro ao adicionar item ao carrinho'
      });
    }
  }

  async visualizarCarrinho(req: Request, res: Response): Promise<void> {
    try {
      const { id_sessao } = req.query;
      const carrinho = await this.carrinhoService.visualizarCarrinho(id_sessao as string);
      res.status(200).json({
        itens: carrinho?.itens || [],
        subtotal: Number(carrinho?.subtotal || 0).toFixed(2),
        total: Number(carrinho?.total || 0).toFixed(2)
      });
    } catch (error) {
      res.status(500).json({
        status: 'erro',
        mensagem: error.message || 'Erro ao visualizar carrinho'
      });
    }
  }

  async removerItem(req: Request, res: Response): Promise<void> {
    try {
      const { id_sessao, id_item_carrinho } = req.body;
      const carrinho = await this.carrinhoService.removerItem(id_sessao, id_item_carrinho);
      res.status(200).json({
        status: 'sucesso',
        mensagem: 'Item removido com sucesso',
        subtotal_carrinho: carrinho.subtotal.toFixed(2)
      });
    } catch (error) {
      res.status(500).json({
        status: 'erro',
        mensagem: error.message || 'Erro ao remover item do carrinho'
      });
    }
  }

  async confirmarCarrinho(req: Request, res: Response): Promise<void> {
    try {
      const { id_sessao } = req.body;
      const carrinho = await this.carrinhoService.confirmarCarrinho(id_sessao);
      res.status(200).json({
        status: 'sucesso',
        mensagem: 'Carrinho confirmado com sucesso',
        carrinho_validado: true,
        total: Number(carrinho.total).toFixed(2),
        proxima_etapa: 'pagamento'
      });
    } catch (error) {
      res.status(500).json({
        status: 'erro',
        mensagem: error.message || 'Erro ao confirmar carrinho'
      });
    }
  }
} 