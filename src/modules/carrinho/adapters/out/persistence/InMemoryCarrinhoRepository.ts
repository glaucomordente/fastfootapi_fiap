import { Carrinho } from "../../domain/entities/Carrinho";
import { CarrinhoRepository } from "../../domain/ports/out/CarrinhoRepository";

/**
 * InMemoryCarrinhoRepository (Adapter - Persistence)
 *
 * Implements the CarrinhoRepository using a simple in-memory Map.
 * Suitable for development or scenarios where cart persistence across restarts isn't required.
 */
export class InMemoryCarrinhoRepository implements CarrinhoRepository {
  private carrinhos: Map<string, Carrinho> = new Map();

  async findByIdSessao(idSessao: string): Promise<Carrinho | null> {
    const carrinho = this.carrinhos.get(idSessao);
    return carrinho ? Promise.resolve(carrinho) : Promise.resolve(null);
  }

  async save(carrinho: Carrinho): Promise<Carrinho> {
    this.carrinhos.set(carrinho.idSessao, carrinho);
    return Promise.resolve(carrinho);
  }

  async deleteByIdSessao(idSessao: string): Promise<boolean> {
    return Promise.resolve(this.carrinhos.delete(idSessao));
  }
}

