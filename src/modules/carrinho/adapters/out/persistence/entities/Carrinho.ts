import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm";
import { ItemCarrinho } from "./ItemCarrinho";

@Entity("carrinhos")
export class Carrinho {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ type: "uuid", unique: true })
    id_sessao: string;

    @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
    subtotal: number;

    @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
    total: number;

    @Column({ type: "varchar", length: 20, default: "ativo" })
    status: string;

    @OneToMany(() => ItemCarrinho, item => item.carrinho)
    itens: ItemCarrinho[];

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
} 