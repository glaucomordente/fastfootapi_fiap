import { Repository, DataSource } from "typeorm";
import { Carrinho } from "../entities/Carrinho";
import { ItemCarrinho } from "../entities/ItemCarrinho";
import { ProductEntity } from "@modules/products/adapters/out/persistence/entities/Product.entity";

export class CarrinhoRepository {
    private carrinhoRepository: Repository<Carrinho>;
    private itemCarrinhoRepository: Repository<ItemCarrinho>;
    private productRepository: Repository<ProductEntity>;

    constructor(dataSource: DataSource) {
        this.carrinhoRepository = dataSource.getRepository(Carrinho);
        this.itemCarrinhoRepository = dataSource.getRepository(ItemCarrinho);
        this.productRepository = dataSource.getRepository(ProductEntity);
    }

    async findOrCreateCarrinho(id_sessao: string): Promise<Carrinho> {
        let carrinho = await this.carrinhoRepository.findOne({ where: { id_sessao } });

        if (!carrinho) {
            carrinho = this.carrinhoRepository.create({
                id_sessao,
                subtotal: 0,
                total: 0,
                status: 'ativo'
            });
            await this.carrinhoRepository.save(carrinho);
        }

        return carrinho;
    }

    async addItemToCarrinho(
        id_sessao: string,
        produto_id: number,
        quantidade: number,
        observacoes: string
    ): Promise<{ item: ItemCarrinho; carrinho: Carrinho }> {
        const carrinho = await this.findOrCreateCarrinho(id_sessao);
        const produto = await this.productRepository.findOne({ where: { id: produto_id } });

        if (!produto) {
            throw new Error('Produto não encontrado');
        }

        const subtotal = produto.price * quantidade;

        const item = this.itemCarrinhoRepository.create({
            carrinho_id: carrinho.id,
            produto_id,
            quantidade,
            observacoes,
            subtotal
        });

        await this.itemCarrinhoRepository.save(item);

        // Atualiza totais do carrinho
        carrinho.subtotal = await this.calculateSubtotal(carrinho.id);
        carrinho.total = carrinho.subtotal;
        await this.carrinhoRepository.save(carrinho);

        return { item, carrinho };
    }

    async getCarrinho(id_sessao: string): Promise<Carrinho | null> {
        return this.carrinhoRepository.findOne({
            where: { id_sessao },
            relations: ['itens', 'itens.produto']
        });
    }

    async removeItem(id_sessao: string, item_id: string): Promise<Carrinho> {
        const carrinho = await this.findOrCreateCarrinho(id_sessao);
        const item = await this.itemCarrinhoRepository.findOne({
            where: { id: item_id, carrinho_id: carrinho.id }
        });

        if (!item) {
            throw new Error('Item não encontrado no carrinho');
        }

        await this.itemCarrinhoRepository.remove(item);

        // Atualiza totais do carrinho
        carrinho.subtotal = await this.calculateSubtotal(carrinho.id);
        carrinho.total = carrinho.subtotal;
        await this.carrinhoRepository.save(carrinho);

        return carrinho;
    }

    async confirmarCarrinho(id_sessao: string): Promise<Carrinho> {
        const carrinho = await this.getCarrinho(id_sessao);

        if (!carrinho || carrinho.itens.length === 0) {
            throw new Error('Carrinho vazio ou não encontrado');
        }

        carrinho.status = 'confirmado';
        return this.carrinhoRepository.save(carrinho);
    }

    private async calculateSubtotal(carrinho_id: string): Promise<number> {
        const result = await this.itemCarrinhoRepository
            .createQueryBuilder('item')
            .select('SUM(item.subtotal)', 'total')
            .where('item.carrinho_id = :carrinho_id', { carrinho_id })
            .getRawOne();

        return Number(result?.total) || 0;
    }
} 