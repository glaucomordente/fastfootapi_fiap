import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { ProductEntity } from "../../../../../products/adapters/out/persistence/entities/Product.entity";

/**
 * Custumer Entity for TypeORM
 *
 * This is the TypeORM entity that maps to the 'custumers' table in the database.
 */
@Entity("custumers")
export class CustumerEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100, nullable: false })
  name: string;

  @Column({ length: 100, nullable: false })
  email: string;

  @Column({ length: 14, nullable: false })
  cpf: string;

  @Column({ length: 20, nullable: true })
  phone: string | null;
}
