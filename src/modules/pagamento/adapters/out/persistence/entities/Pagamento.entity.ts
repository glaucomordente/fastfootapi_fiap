import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { StatusPagamento } from '../../domain/entities/Pagamento';

@Entity('pagamentos') // Table name
export class PagamentoEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Index() // Index for faster lookup by session
  @Column({ name: 'id_sessao', length: 36 })
  idSessao: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'valor_total' })
  valorTotal: number;

  @Column({ type: 'varchar', length: 20, default: 'pendente' })
  status: StatusPagamento;

  @Column({ name: 'qrcode_url', length: 255, nullable: true })
  qrcodeUrl?: string;

  @Column({ name: 'qrcode_texto', type: 'text', nullable: true })
  qrcodeTexto?: string;

  @Column({ type: 'timestamp', nullable: true })
  expiracao?: Date;

  @Column({ name: 'id_transacao_mp', length: 100, nullable: true })
  idTransacaoMp?: string;

  @Column({ name: 'metodo_pagamento', length: 50, nullable: true })
  metodoPagamento?: string;

  @Index() // Index for potentially linking payments to orders
  @Column({ name: 'id_pedido', length: 36, nullable: true })
  idPedido?: string;

  @CreateDateColumn({ name: 'data_criacao' })
  dataCriacao: Date;

  @UpdateDateColumn({ name: 'data_atualizacao' })
  dataAtualizacao: Date;
}

