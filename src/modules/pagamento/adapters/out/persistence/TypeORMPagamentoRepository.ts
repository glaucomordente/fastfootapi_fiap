import { Injectable } from '@nestjs/common'; // Adjust if not using NestJS
import { InjectRepository } from '@nestjs/typeorm'; // Adjust if not using NestJS
import { Repository } from 'typeorm';
import { Pagamento } from '../../domain/entities/Pagamento';
import { PagamentoRepository } from '../../domain/ports/out/PagamentoRepository';
import { PagamentoEntity } from './entities/Pagamento.entity';

// @Injectable() // Uncomment if using NestJS DI
export class TypeORMPagamentoRepository implements PagamentoRepository {

  constructor(
    // @InjectRepository(PagamentoEntity) // Uncomment if using NestJS DI
    private readonly pagamentoOrmRepository: Repository<PagamentoEntity>,
  ) {}

  private mapEntityToDomain(entity: PagamentoEntity): Pagamento {
    const pagamento = new Pagamento(
      entity.id,
      entity.idSessao,
      entity.valorTotal
    );
    // Manually map other properties from entity to domain object
    pagamento.status = entity.status;
    pagamento.qrcodeUrl = entity.qrcodeUrl;
    pagamento.qrcodeTexto = entity.qrcodeTexto;
    pagamento.expiracao = entity.expiracao;
    pagamento.idTransacaoMp = entity.idTransacaoMp;
    pagamento.metodoPagamento = entity.metodoPagamento;
    pagamento.idPedido = entity.idPedido;
    // dataCriacao and dataAtualizacao are handled by the domain constructor/methods
    // Reflect the DB state for these timestamps if necessary
    (pagamento as any).dataCriacao = entity.dataCriacao; // Use type assertion if needed
    (pagamento as any).dataAtualizacao = entity.dataAtualizacao;

    return pagamento;
  }

  private mapDomainToEntity(domain: Pagamento): PagamentoEntity {
      const entity = new PagamentoEntity();
      entity.id = domain.id;
      entity.idSessao = domain.idSessao;
      entity.valorTotal = domain.valorTotal;
      entity.status = domain.status;
      entity.qrcodeUrl = domain.qrcodeUrl;
      entity.qrcodeTexto = domain.qrcodeTexto;
      entity.expiracao = domain.expiracao;
      entity.idTransacaoMp = domain.idTransacaoMp;
      entity.metodoPagamento = domain.metodoPagamento;
      entity.idPedido = domain.idPedido;
      // Timestamps are handled by TypeORM decorators
      return entity;
  }

  async findById(id: string): Promise<Pagamento | null> {
    const entity = await this.pagamentoOrmRepository.findOne({ where: { id } });
    return entity ? this.mapEntityToDomain(entity) : null;
  }

  async findBySessaoId(idSessao: string): Promise<Pagamento | null> {
    // Find the latest payment attempt for the session, for example
    const entity = await this.pagamentoOrmRepository.findOne({
      where: { idSessao },
      order: { dataCriacao: 'DESC' },
    });
    return entity ? this.mapEntityToDomain(entity) : null;
  }

  async save(pagamento: Pagamento): Promise<Pagamento> {
    const entity = this.mapDomainToEntity(pagamento);
    // TypeORM's save handles both insert and update based on primary key presence
    const savedEntity = await this.pagamentoOrmRepository.save(entity);
    return this.mapEntityToDomain(savedEntity); // Map back to domain
  }
}

