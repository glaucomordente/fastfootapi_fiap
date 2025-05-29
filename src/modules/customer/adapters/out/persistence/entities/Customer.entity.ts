import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { IsEmail, IsNotEmpty, Length, Matches } from "class-validator";
import { ProductEntity } from "../../../../../products/adapters/out/persistence/entities/Product.entity";

/**
 * Custumer Entity for TypeORM
 *
 * This is the TypeORM entity that maps to the 'custumers' table in the database.
 * Includes validations for email, CPF and phone fields.
 */
@Entity("custumers")
export class CustumerEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100, nullable: false })
  @IsNotEmpty({ message: "Name is required" })
  @Length(2, 100, { message: "Name must be between 2 and 100 characters" })
  name: string;

  @Column({ length: 100, nullable: false, unique: true })
  @IsNotEmpty({ message: "Email is required" })
  @IsEmail({}, { message: "Invalid email format" })
  @Length(5, 100, { message: "Email must be between 5 and 100 characters" })
  email: string;

  @Column({ length: 14, nullable: false, unique: true })
  @IsNotEmpty({ message: "CPF is required" })
  @Matches(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, {
    message: "CPF must be in format: XXX.XXX.XXX-XX",
  })
  cpf: string;

  @Column({ length: 20, nullable: true })
  @Matches(/^\(\d{2}\)\s\d{4,5}-\d{4}$/, {
    message: "Phone must be in format: (XX) XXXXX-XXXX or (XX) XXXX-XXXX",
    each: false,
  })
  phone: string | null;
}
