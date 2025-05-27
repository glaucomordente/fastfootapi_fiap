import { CarrinhoUseCase, AdicionarItemDTO, RemoverItemDTO, CarrinhoModificadoResponse, ConfirmarCarrinhoResponse, VisualizarCarrinhoResponse } from "../domain/ports/in/CarrinhoUseCase";
import { CarrinhoRepository } from "../domain/ports/out/CarrinhoRepository";
import { ProductRepository } from "../../products/domain/ports/out/ProductRepository"; // Need Product repo
import { Carrinho } from "../domain/entities/Carrinho";

export class CarrinhoService implements CarrinhoUseCase {
  constructor(
    private readonly carrinhoRepository: CarrinhoRepository,
    private readonly productRepository: ProductRepository // Inject Product repo
  ) {}

  private async getOrCreateCarrinho(idSessao: string): Promise<Carrinho> {
    let carrinho = await this.carrinhoRepository.findByIdSessao(idSessao);
    if (!carrinho) {
      carrinho = new Carrinho(idSessao);
      await this.carrinhoRepository.save(carrinho);
    }
    return carrinho;
  }

  async adicionarItem(data: AdicionarItemDTO): Promise<CarrinhoModificadoResponse> {
    const carrinho = await this.getOrCreateCarrinho(data.id_sessao);
    const produto = await this.productRepository.findById(data.id_produto);

    if (!produto) {
      return {
        status: "erro",
        mensagem: "Produto não encontrado.",
        subtotal_carrinho: carrinho.subtotal,
        timestamp: new Date().toISOString(),
      };
    }

    try {
      const itemAdicionado = carrinho.adicionarItem(produto, data.quantidade, data.observacoes);
      await this.carrinhoRepository.save(carrinho);
      return {
        status: "sucesso",
        mensagem: "Item adicionado ao carrinho.",
        id_item_carrinho: itemAdicionado.id,
        subtotal_carrinho: carrinho.subtotal,
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      return {
        status: "erro",
        mensagem: error.message || "Erro ao adicionar item.",
        subtotal_carrinho: carrinho.subtotal,
        timestamp: new Date().toISOString(),
      };
    }
  }

  async confirmarCarrinho(idSessao: string): Promise<ConfirmarCarrinhoResponse> {
    const carrinho = await this.carrinhoRepository.findByIdSessao(idSessao);

    if (!carrinho) {
      return {
        status: "erro",
        mensagem: "Carrinho não encontrado para esta sessão.",
        carrinho_validado: false,
        total: 0,
        proxima_etapa: "",
        timestamp: new Date().toISOString(),
      };
    }

    try {
      carrinho.confirmarCarrinho();
      await this.carrinhoRepository.save(carrinho);
      return {
        status: "sucesso",
        mensagem: "Carrinho confirmado com sucesso.",
        carrinho_validado: true,
        total: carrinho.total,
        proxima_etapa: "Pagamento", // Define next step
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      return {
        status: "erro",
        mensagem: error.message || "Erro ao confirmar carrinho.",
        carrinho_validado: false,
        total: carrinho.total,
        proxima_etapa: "",
        timestamp: new Date().toISOString(),
      };
    }
  }

  async visualizarCarrinho(idSessao: string): Promise<VisualizarCarrinhoResponse | null> {
    const carrinho = await this.carrinhoRepository.findByIdSessao(idSessao);

    if (!carrinho) {
      // According to contract, should return 200 with empty/default values? Or handle in controller?
      // Returning null for now, controller can decide response format.
      return null;
      // Alternative: Return default structure
      // return {
      //   itens: [],
      //   subtotal: 0,
      //   total: 0,
      //   timestamp: new Date().toISOString()
      // };
    }

    return {
      itens: carrinho.getItensFormatado(),
      subtotal: carrinho.subtotal,
      total: carrinho.total,
      timestamp: new Date().toISOString(),
    };
  }

  async removerItem(data: RemoverItemDTO): Promise<CarrinhoModificadoResponse> {
    const carrinho = await this.carrinhoRepository.findByIdSessao(data.id_sessao);

    if (!carrinho) {
      return {
        status: "erro",
        mensagem: "Carrinho não encontrado.",
        subtotal_carrinho: 0,
        timestamp: new Date().toISOString(),
      };
    }

    const removido = carrinho.removerItem(data.id_item_carrinho);

    if (removido) {
      await this.carrinhoRepository.save(carrinho);
      return {
        status: "sucesso",
        mensagem: "Item removido do carrinho.",
        subtotal_carrinho: carrinho.subtotal,
        timestamp: new Date().toISOString(),
      };
    } else {
      return {
        status: "erro",
        mensagem: "Item não encontrado no carrinho.",
        subtotal_carrinho: carrinho.subtotal,
        timestamp: new Date().toISOString(),
      };
    }
  }
}

