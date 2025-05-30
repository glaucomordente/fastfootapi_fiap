import { CarrinhoRepository } from '../../adapters/out/persistence/repositories/CarrinhoRepository';
import { Carrinho } from '../../adapters/out/persistence/entities/Carrinho';
import { ItemCarrinho } from '../../adapters/out/persistence/entities/ItemCarrinho';

export class CarrinhoService {
  constructor(private carrinhoRepository: CarrinhoRepository) {}

  async adicionarItem(
    id_sessao: string,
    id_produto: number,
    quantidade: number,
    observacoes: string
  ): Promise<{ item: ItemCarrinho; carrinho: Carrinho }> {
    return this.carrinhoRepository.addItemToCarrinho(
      id_sessao,
      id_produto,
      quantidade,
      observacoes
    );
  }

  async visualizarCarrinho(id_sessao: string): Promise<Carrinho | null> {
    return this.carrinhoRepository.getCarrinho(id_sessao);
  }

  async removerItem(id_sessao: string, id_item_carrinho: string): Promise<Carrinho> {
    return this.carrinhoRepository.removeItem(id_sessao, id_item_carrinho);
  }

  async confirmarCarrinho(id_sessao: string): Promise<Carrinho> {
    return this.carrinhoRepository.confirmarCarrinho(id_sessao);
  }
} 