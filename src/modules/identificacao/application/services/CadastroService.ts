import { v4 as uuidv4 } from 'uuid';
import { CadastroRequest } from '../../domain/models/CadastroRequest';
import { CadastroResponse } from '../../domain/models/CadastroResponse';
import { ClienteEntity } from '../../adapters/out/persistence/entities/Cliente.entity'; // For future use
// import { getDataSource } from '../../../../lib/typeorm'; // For future use

export class CadastroService {
  public async inserirDadosCadastro(data: CadastroRequest): Promise<CadastroResponse> {
    const timestamp = new Date().toISOString();
    console.log('Received data for new registration:', data);

    // Simulate database interaction (mocked for now)
    try {
      // In a real scenario, here you would:
      // 1. Get DataSource and Repository
      // const dataSource = await getDataSource();
      // const clienteRepository = dataSource.getRepository(ClienteEntity);
      // 2. Check for existing CPF/Email if they need to be unique
      // const existingClienteByCpf = await clienteRepository.findOneBy({ cpf: data.cpf });
      // if (existingClienteByCpf) {
      //   return {
      //     status: 'erro',
      //     mensagem: 'CPF já cadastrado.',
      //     timestamp,
      //   };
      // }
      // const existingClienteByEmail = await clienteRepository.findOneBy({ email: data.email });
      // if (existingClienteByEmail) {
      //   return {
      //     status: 'erro',
      //     mensagem: 'Email já cadastrado.',
      //     timestamp,
      //   };
      // }
      // 3. Create and save the new entity
      // const novoCliente = clienteRepository.create({
      //   id: uuidv4(), // Let TypeORM handle if using @PrimaryGeneratedColumn('uuid')
      //   nome: data.nome,
      //   email: data.email,
      //   cpf: data.cpf,
      //   telefone: data.telefone,
      //   // data_nascimento needs to be handled (e.g. store as string or Date)
      // });
      // await clienteRepository.save(novoCliente);
      
      const id_cliente = uuidv4(); // Mocked ID generation

      return {
        status: 'sucesso',
        mensagem: 'Cliente cadastrado com sucesso!',
        id_cliente: id_cliente,
        timestamp: timestamp,
      };
    } catch (error) {
      console.error('Error during mock registration:', error);
      return {
        status: 'erro',
        mensagem: 'Erro ao cadastrar cliente.', // Could be error.message in a real scenario
        timestamp: timestamp,
      };
    }
  }
}
