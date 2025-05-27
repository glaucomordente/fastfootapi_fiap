import { IdentificacaoController } from './identificacaoController';
import { IdentificacaoService } from '../modules/identificacao/application/services/IdentificacaoService';
import { CadastroService } from '../modules/identificacao/application/services/CadastroService';
import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

// Mock the services and uuid
jest.mock('../modules/identificacao/application/services/IdentificacaoService');
jest.mock('../modules/identificacao/application/services/CadastroService');
jest.mock('uuid');

describe('IdentificacaoController', () => {
  let controller: IdentificacaoController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  
  // We need to type the mocked constructor for services
  let MockedIdentificacaoService: jest.MockedClass<typeof IdentificacaoService>;
  let MockedCadastroService: jest.MockedClass<typeof CadastroService>;
  let mockUuidv4: jest.MockedFunction<typeof uuidv4>;

  beforeEach(() => {
    // Clear all instances and calls to constructor and all methods:
    (IdentificacaoService as jest.MockedClass<typeof IdentificacaoService>).mockClear();
    (CadastroService as jest.MockedClass<typeof CadastroService>).mockClear();
    (uuidv4 as jest.MockedFunction<typeof uuidv4>).mockClear();

    controller = new IdentificacaoController();
    
    // Access the mocked instances created by the controller's constructor
    // These will be undefined if the controller does not assign them to properties,
    // or if jest.mock isn't working as expected for the class instances.
    // However, jest.mock replaces the constructor, so `new Service()` returns a mock.
    // We can then access the prototype methods if they are called by the controller.

    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    
    // Assign mocked functions to the variables
    MockedIdentificacaoService = IdentificacaoService as jest.MockedClass<typeof IdentificacaoService>;
    MockedCadastroService = CadastroService as jest.MockedClass<typeof CadastroService>;
    mockUuidv4 = uuidv4 as jest.MockedFunction<typeof uuidv4>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAcessoSistema', () => {
    it('should return 200 with session data and a UUID', async () => {
      const testUuid = 'test-uuid-123';
      mockUuidv4.mockReturnValue(testUuid);
      
      // Freeze time for consistent timestamp (optional, but good for exact match)
      const now = new Date();
      jest.spyOn(global, 'Date').mockImplementation(() => now);

      await controller.getAcessoSistema(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'ativo',
        mensagem: 'Bem-vindo ao sistema FastFoodAPI!',
        timestamp: now.toISOString(),
        id_sessao: testUuid,
      });
      expect(mockUuidv4).toHaveBeenCalledTimes(1);
      
      // Restore Date mock
      (global.Date as jest.Mock).mockRestore();
    });

    it('should return 500 if uuid generation fails', async () => {
      mockUuidv4.mockImplementation(() => {
        throw new Error('UUID generation failed');
      });

      await controller.getAcessoSistema(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        status: 'erro',
        mensagem: 'Ocorreu um erro ao processar a solicitação de acesso.',
      }));
    });
  });

  describe('postValidaIdentificacao', () => {
    let mockValidarIdentificacao: jest.Mock;

    beforeEach(() => {
      // IdentificacaoService is auto-mocked. Its methods are jest.fn() by default.
      // We need to access the mock instance's method that the controller will call.
      // This assumes 'this.identificacaoService = new IdentificacaoService()' in controller constructor
      // and IdentificacaoService.prototype.validarIdentificacao is what gets called.
      mockValidarIdentificacao = jest.fn();
      IdentificacaoService.prototype.validarIdentificacao = mockValidarIdentificacao;
    });
    
    it('should call identificacaoService.validarIdentificacao and return 200 for valid input', async () => {
      const requestBody = {
        id_sessao: 'sessao-123',
        tipo_identificacao: 'cpf',
        valor_identificacao: '12345678900',
      };
      mockRequest.body = requestBody;
      const serviceResponse = { status: 'valido', mensagem: 'Validado', timestamp: new Date().toISOString() };
      mockValidarIdentificacao.mockResolvedValue(serviceResponse);

      await controller.postValidaIdentificacao(mockRequest as Request, mockResponse as Response);

      expect(mockValidarIdentificacao).toHaveBeenCalledWith(requestBody);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(serviceResponse);
    });

    it('should return 400 if service returns "invalido"', async () => {
      const requestBody = {
        id_sessao: 'sessao-123',
        tipo_identificacao: 'cpf',
        valor_identificacao: 'invalid-cpf',
      };
      mockRequest.body = requestBody;
      const serviceResponse = { status: 'invalido', mensagem: 'CPF inválido', timestamp: new Date().toISOString() };
      mockValidarIdentificacao.mockResolvedValue(serviceResponse);

      await controller.postValidaIdentificacao(mockRequest as Request, mockResponse as Response);
      
      expect(mockValidarIdentificacao).toHaveBeenCalledWith(requestBody);
      expect(mockResponse.status).toHaveBeenCalledWith(400); // As per current controller logic
      expect(mockResponse.json).toHaveBeenCalledWith(serviceResponse);
    });

    it('should return 400 for missing id_sessao and not call service', async () => {
      mockRequest.body = { tipo_identificacao: 'cpf', valor_identificacao: '12345678900' };

      await controller.postValidaIdentificacao(mockRequest as Request, mockResponse as Response);

      expect(mockValidarIdentificacao).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        status: 'erro',
        mensagem: expect.stringContaining('Campos obrigatórios ausentes'),
      }));
    });
    
    it('should return 500 if service throws an error', async () => {
      const requestBody = {
        id_sessao: 'sessao-123',
        tipo_identificacao: 'cpf',
        valor_identificacao: '12345678900',
      };
      mockRequest.body = requestBody;
      mockValidarIdentificacao.mockRejectedValue(new Error('Service failure'));

      await controller.postValidaIdentificacao(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        status: 'erro',
        mensagem: 'Ocorreu um erro ao processar a validação da identificação.',
      }));
    });
  });

  describe('getBuscaIdentificacao', () => {
    let mockBuscarIdentificacao: jest.Mock;

    beforeEach(() => {
      mockBuscarIdentificacao = jest.fn();
      IdentificacaoService.prototype.buscarIdentificacao = mockBuscarIdentificacao;
    });

    it('should call service and return 200 with client data if found', async () => {
      mockRequest.query = {
        id_sessao: 'sessao-abc',
        tipo_identificacao: 'email',
        valor_identificacao: 'test@example.com',
      };
      const serviceResponse = { status: 'encontrado', cliente: { id: 'client-1', nome: 'Test Client' }, timestamp: new Date().toISOString() };
      mockBuscarIdentificacao.mockResolvedValue(serviceResponse);

      await controller.getBuscaIdentificacao(mockRequest as Request, mockResponse as Response);

      expect(mockBuscarIdentificacao).toHaveBeenCalledWith('email', 'test@example.com', 'sessao-abc');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(serviceResponse);
    });

    it('should return 200 with "nao_encontrado" if client not found by service', async () => {
      mockRequest.query = {
        id_sessao: 'sessao-abc',
        tipo_identificacao: 'cpf',
        valor_identificacao: '00000000000',
      };
      const serviceResponse = { status: 'nao_encontrado', mensagem: 'Cliente não encontrado.', timestamp: new Date().toISOString() };
      mockBuscarIdentificacao.mockResolvedValue(serviceResponse);

      await controller.getBuscaIdentificacao(mockRequest as Request, mockResponse as Response);

      expect(mockBuscarIdentificacao).toHaveBeenCalledWith('cpf', '00000000000', 'sessao-abc');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(serviceResponse);
    });

    it('should return 400 for missing query parameter and not call service', async () => {
      mockRequest.query = { id_sessao: 'sessao-abc', tipo_identificacao: 'email' }; // valor_identificacao missing

      await controller.getBuscaIdentificacao(mockRequest as Request, mockResponse as Response);

      expect(mockBuscarIdentificacao).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        status: 'erro',
        mensagem: expect.stringContaining('Parâmetros de consulta obrigatórios ausentes'),
      }));
    });
    
    it('should return 500 if service throws an error', async () => {
      mockRequest.query = {
        id_sessao: 'sessao-abc',
        tipo_identificacao: 'email',
        valor_identificacao: 'test@example.com',
      };
      mockBuscarIdentificacao.mockRejectedValue(new Error('Service failure'));

      await controller.getBuscaIdentificacao(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        status: 'erro',
        mensagem: 'Ocorreu um erro ao processar a busca da identificação.',
      }));
    });
  });

  describe('postInsereDadosCadastro', () => {
    let mockInserirDadosCadastro: jest.Mock;

    beforeEach(() => {
      mockInserirDadosCadastro = jest.fn();
      CadastroService.prototype.inserirDadosCadastro = mockInserirDadosCadastro;
    });

    const validRequestBody = {
      id_sessao: 'sessao-xyz',
      nome: 'Test User',
      email: 'test@example.com',
      cpf: '12345678901',
      data_nascimento: '1990-01-01',
      telefone: '1234567890',
    };

    it('should call service and return 200 on successful creation', async () => {
      mockRequest.body = validRequestBody;
      const serviceResponse = { status: 'sucesso', mensagem: 'Cadastrado!', id_cliente: 'client-new-id', timestamp: new Date().toISOString() };
      mockInserirDadosCadastro.mockResolvedValue(serviceResponse);

      await controller.postInsereDadosCadastro(mockRequest as Request, mockResponse as Response);

      expect(mockInserirDadosCadastro).toHaveBeenCalledWith(validRequestBody);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(serviceResponse);
    });

    it('should return 400 if service returns "erro"', async () => {
      mockRequest.body = validRequestBody;
      const serviceResponse = { status: 'erro', mensagem: 'CPF já existe', timestamp: new Date().toISOString() };
      mockInserirDadosCadastro.mockResolvedValue(serviceResponse);

      await controller.postInsereDadosCadastro(mockRequest as Request, mockResponse as Response);
      
      expect(mockInserirDadosCadastro).toHaveBeenCalledWith(validRequestBody);
      expect(mockResponse.status).toHaveBeenCalledWith(400); // As per controller logic
      expect(mockResponse.json).toHaveBeenCalledWith(serviceResponse);
    });

    it('should return 400 for missing required body field (e.g., nome) and not call service', async () => {
      const { nome, ...incompleteBody } = validRequestBody; // 'nome' is removed
      mockRequest.body = incompleteBody;

      await controller.postInsereDadosCadastro(mockRequest as Request, mockResponse as Response);

      expect(mockInserirDadosCadastro).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        status: 'erro',
        mensagem: expect.stringContaining('Campos obrigatórios ausentes'),
      }));
    });
    
    it('should return 500 if service throws an error', async () => {
      mockRequest.body = validRequestBody;
      mockInserirDadosCadastro.mockRejectedValue(new Error('Service failure'));
      
      await controller.postInsereDadosCadastro(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        status: 'erro',
        mensagem: 'Ocorreu um erro ao processar o cadastro.',
      }));
    });
  });
});
