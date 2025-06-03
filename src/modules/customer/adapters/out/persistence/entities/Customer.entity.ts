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
  @IsNotEmpty({ message: 'Name is required' })
  @Length(3, 100, { message: 'Name must be between 3 and 100 characters' })
  name: string;

  @Column({ unique: true })
  @IsEmail({}, { message: 'Invalid email' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @Column({ unique: true })
  @IsNotEmpty({ message: 'CPF is required' })
  @Length(11, 11, { message: 'CPF must have 11 digits' })
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
