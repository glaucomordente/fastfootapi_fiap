import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('clientes') // Defines the table name
export class ClienteEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  nome: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 11, unique: true })
  cpf: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  telefone?: string;
  
  // Placeholder for ultimo_pedido. This might be a relationship or a simple date.
  // For now, a nullable string column. In a real app, consider how this is updated.
  @Column({ type: 'timestamp', nullable: true })
  ultimo_pedido?: Date; 

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
