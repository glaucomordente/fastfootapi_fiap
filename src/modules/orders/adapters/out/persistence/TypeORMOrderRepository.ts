import { DataSource, Repository } from "typeorm";
import { Order } from "../../../domain/entities/Order";
import { OrderRepository } from "../../../domain/repositories/OrderRepository";

export class TypeORMOrderRepository implements OrderRepository {
  private repository: Repository<Order>;

  constructor(private dataSource: DataSource) {
    this.repository = this.dataSource.getRepository(Order);
  }

  async findById(id: string): Promise<Order | null> {
    return this.repository.findOne({ where: { id } });
  }

  async save(order: Order): Promise<Order> {
    return this.repository.save(order);
  }
} 