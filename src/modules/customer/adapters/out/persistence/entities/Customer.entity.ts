import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { IsEmail, IsNotEmpty, Length } from 'class-validator';

/**
 * Customer Entity for TypeORM
 * 
 * This is the TypeORM entity that maps to the 'customers' table in the database.
 */
@Entity("customers")
export class CustomerEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @IsNotEmpty({ message: 'O nome é obrigatório' })
  @Length(3, 100, { message: 'O nome deve ter entre 3 e 100 caracteres' })
  name: string;

  @Column({ unique: true })
  @IsEmail({}, { message: 'Email inválido' })
  @IsNotEmpty({ message: 'O email é obrigatório' })
  email: string;

  @Column({ unique: true })
  @IsNotEmpty({ message: 'O CPF é obrigatório' })
  @Length(11, 11, { message: 'O CPF deve ter 11 dígitos' })
  cpf: string;

  @Column({ nullable: true })
  phone: string;

  @OneToMany('OrderEntity', 'customer')
  orders: any[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
