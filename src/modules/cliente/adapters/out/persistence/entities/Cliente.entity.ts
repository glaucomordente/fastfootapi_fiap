import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
// Importar OrderEntity se já existir ou quando for criada
// import { OrderEntity } from '../../orders/adapters/out/persistence/entities/Order.entity';

@Entity('clientes') // Nome da tabela no banco de dados
export class ClienteEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  nome: string;

  @Column({ length: 100, unique: true })
  email: string;

  @Column({ length: 11, unique: true })
  cpf: string;

  @Column({ length: 20, nullable: true })
  telefone: string;

  @Column({ type: 'date', nullable: true })
  data_nascimento: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relacionamento com Pedidos (se necessário)
  // @OneToMany(() => OrderEntity, order => order.cliente)
  // pedidos: OrderEntity[];

  // Coluna para último pedido (pode ser gerenciada via lógica de aplicação ou trigger)
  @Column({ type: 'timestamp', nullable: true })
  ultimo_pedido_at: Date;
}

