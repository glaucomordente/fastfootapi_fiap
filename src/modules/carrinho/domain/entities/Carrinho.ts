import { Product } from "../../products/domain/entities/Product"; // Assuming Product entity exists
import { v4 as uuidv4 } from 'uuid';

// Represents the structure of a product within the cart
interface ProdutoCarrinho {
    id: string; // Product UUID
    nome: string;
    categoria: string; // Category name
    preco_unitario: number;
}

// Represents an item within the shopping cart
export class ItemCarrinho {
    public readonly id: string; // Unique ID for the cart item itself (UUID)
    public produto: ProdutoCarrinho;
    public quantidade: number;
    public observacoes: string | null;
    public subtotal: number;

    constructor(
        id: string | null,
        produto: ProdutoCarrinho,
        quantidade: number,
        observacoes: string | null = null
    ) {
        if (!id) {
            id = uuidv4(); // Generate UUID for the cart item
        }
        if (quantidade <= 0) {
            throw new Error("Quantidade deve ser maior que zero.");
        }

        this.id = id;
        this.produto = produto;
        this.quantidade = quantidade;
        this.observacoes = observacoes;
        this.subtotal = this.calcularSubtotal();
    }

    private calcularSubtotal(): number {
        return this.produto.preco_unitario * this.quantidade;
    }

    atualizarQuantidade(novaQuantidade: number): void {
        if (novaQuantidade <= 0) {
            throw new Error("Quantidade deve ser maior que zero.");
        }
        this.quantidade = novaQuantidade;
        this.subtotal = this.calcularSubtotal();
    }

    adicionarObservacoes(observacoes: string): void {
        this.observacoes = observacoes;
    }
}

// Represents the shopping cart associated with a session
export class Carrinho {
    public readonly idSessao: string;
    public itens: Map<string, ItemCarrinho>; // Map product ID to ItemCarrinho
    public subtotal: number;
    public total: number; // Could include taxes, discounts later
    public validado: boolean;
    public timestamp: Date;

    constructor(idSessao: string) {
        this.idSessao = idSessao;
        this.itens = new Map<string, ItemCarrinho>();
        this.subtotal = 0;
        this.total = 0;
        this.validado = false;
        this.timestamp = new Date();
        this.recalcularTotais();
    }

    adicionarItem(produto: Product, quantidade: number, observacoes?: string): ItemCarrinho {
        if (!produto.disponivel) {
            throw new Error(`Produto '${produto.name}' não está disponível.`);
        }
        // TODO: Check stock if necessary (product.stock < quantidade)

        const produtoCarrinho: ProdutoCarrinho = {
            id: produto.id,
            nome: produto.name,
            categoria: produto.categoryName || 'Desconhecida', // Use loaded category name
            preco_unitario: produto.price
        };

        let itemExistente = this.itens.get(produto.id);

        if (itemExistente) {
            itemExistente.atualizarQuantidade(itemExistente.quantidade + quantidade);
            if (observacoes) {
                itemExistente.adicionarObservacoes(observacoes); // Append or replace?
            }
            this.recalcularTotais();
            this.timestamp = new Date();
            return itemExistente;
        } else {
            const novoItem = new ItemCarrinho(null, produtoCarrinho, quantidade, observacoes);
            this.itens.set(produto.id, novoItem);
            this.recalcularTotais();
            this.timestamp = new Date();
            return novoItem;
        }
    }

    removerItem(idItemCarrinho: string): boolean {
        let itemRemovido = false;
        for (const [produtoId, item] of this.itens.entries()) {
            if (item.id === idItemCarrinho) {
                this.itens.delete(produtoId);
                itemRemovido = true;
                break;
            }
        }
        if (itemRemovido) {
            this.recalcularTotais();
            this.timestamp = new Date();
        }
        return itemRemovido;
    }

    confirmarCarrinho(): void {
        if (this.itens.size === 0) {
            throw new Error("Carrinho está vazio.");
        }
        this.validado = true;
        this.timestamp = new Date();
        // Logic for next step could be added here or in the service
    }

    private recalcularTotais(): void {
        let subtotalCalculado = 0;
        this.itens.forEach(item => {
            subtotalCalculado += item.subtotal;
        });
        this.subtotal = subtotalCalculado;
        this.total = subtotalCalculado; // For now, total equals subtotal
    }

    // Method to get items formatted as per API contract
    getItensFormatado(): any[] {
        const itensFormatados: any[] = [];
        this.itens.forEach(item => {
            itensFormatados.push({
                id: item.id,
                produto: {
                    id: item.produto.id,
                    nome: item.produto.nome,
                    categoria: item.produto.categoria,
                    preco_unitario: item.produto.preco_unitario
                },
                quantidade: item.quantidade,
                observacoes: item.observacoes,
                subtotal: item.subtotal
            });
        });
        return itensFormatados;
    }
}

