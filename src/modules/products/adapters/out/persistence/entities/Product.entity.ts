import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { CategoryEntity } from '../../categories/adapters/out/persistence/entities/Category.entity'; // Adjust path if needed

@Entity('produtos') // Nome da tabela no banco de dados
export class ProductEntity {
  @PrimaryColumn('uuid') // Changed to UUID
  id: string;

  @Column({ length: 100 })
  nome: string;

  @Column({ type: 'text', nullable: true })
  descricao: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  preco: number;

  @Column({ length: 255, nullable: true, name: 'imagem_url' })
  imagemUrl: string;

  @Column({ type: 'boolean', default: true })
  disponivel: boolean; // Added field based on contract

  @Column({ type: 'boolean', default: false })
  destaque: boolean; // Added field based on contract

  @Column({ name: 'category_id' })
  categoryId: number; // Keep relation ID

  @ManyToOne(() => CategoryEntity, category => category.products, { eager: true }) // Eager load category to get name easily
  @JoinColumn({ name: 'category_id' })
  categoria: CategoryEntity; // Relation to get category name

  // Stock might still be relevant internally, even if not in API response
  @Column({ type: 'int', default: 0 })
  stock: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

