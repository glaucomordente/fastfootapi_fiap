import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { Carrinho } from "./Carrinho";
import { ProductEntity } from "@modules/products/adapters/out/persistence/entities/Product.entity";

@Entity("itens_carrinho")
export class ItemCarrinho {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ type: "uuid" })
    carrinho_id: string;

    @Column({ type: "integer" })
    produto_id: number;

    @Column({ type: "integer" })
    quantidade: number;

    @Column({ type: "varchar", length: 500, nullable: true })
    observacoes: string;

    @Column({ type: "decimal", precision: 10, scale: 2 })
    subtotal: number;

    @ManyToOne(() => Carrinho, carrinho => carrinho.itens)
    @JoinColumn({ name: "carrinho_id" })
    carrinho: Carrinho;

    @ManyToOne(() => ProductEntity)
    @JoinColumn({ name: "produto_id" })
    produto: ProductEntity;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
} 