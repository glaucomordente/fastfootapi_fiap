import { Router, Request, Response } from 'express';
import { CategoryModule } from '../modules/categories/CategoryModule';
import { ProductModule } from '../modules/products/ProductModule';
import { ClienteModule } from '../modules/cliente/ClienteModule';
import { CarrinhoModule } from '../modules/carrinho/CarrinhoModule';
import { PagamentoModule } from '../modules/pagamento/PagamentoModule'; // Import PagamentoModule
import { OrderModule } from '../modules/orders/OrderModule'; // Import OrderModule
import { SistemaController } from '../modules/sistema/adapters/in/web/SistemaController';
import { SistemaService } from '../modules/sistema/application/services/SistemaService';

/**
 * Setup routes with initialized modules
 * @param categoryModule Initialized CategoryModule
 * @param productModule Initialized ProductModule
 * @param clienteModule Initialized ClienteModule
 * @param carrinhoModule Initialized CarrinhoModule
 * @param pagamentoModule Initialized PagamentoModule
 * @param orderModule Initialized OrderModule
 * @returns Express router
 */
export default function setupRoutes(
  categoryModule: CategoryModule,
  productModule: ProductModule,
  clienteModule: ClienteModule,
  carrinhoModule: CarrinhoModule,
  pagamentoModule: PagamentoModule, // Accept PagamentoModule
  orderModule: OrderModule // Accept OrderModule
): Router {
  const router = Router();

  // Instantiate Sistema module components
  const sistemaService = new SistemaService();
  const sistemaController = new SistemaController(sistemaService);

  // Get controllers from initialized modules
  const categoryController = categoryModule.getController();
  const productController = productModule.getController();
  const clienteController = clienteModule.getController();
  const carrinhoController = carrinhoModule.getController();
  const pagamentoController = pagamentoModule.getController(); // Get PagamentoController
  // const orderController = orderModule.getController(); // Get OrderController (when ready)

  // Health check route
  router.get('/health', (req: Request, res: Response) => {
    res.status(200).json({ status: 'OK' });
  });

  // --- Novas Rotas API V1 ---
  const apiV1Router = Router(); // Create a sub-router for /api/v1

  // Sistema
  apiV1Router.get('/sistema/acesso', sistemaController.getAcesso.bind(sistemaController));

  // Cliente (Identificação/Cadastro)
  apiV1Router.post('/identificacao/validar', clienteController.validarIdentificacao.bind(clienteController));
  apiV1Router.get('/identificacao/buscar', clienteController.buscarCliente.bind(clienteController));
  apiV1Router.post('/cadastro/inserir', clienteController.cadastrarCliente.bind(clienteController));

  // Produto
  apiV1Router.get('/produtos/listar', productController.listarProdutos.bind(productController));

  // Carrinho
  apiV1Router.post('/carrinho/adicionar/lanche', carrinhoController.adicionarLanche.bind(carrinhoController));
  apiV1Router.post('/carrinho/confirmar', carrinhoController.confirmarCarrinho.bind(carrinhoController));
  apiV1Router.get('/carrinho/visualizar', carrinhoController.visualizarCarrinho.bind(carrinhoController));
  apiV1Router.delete('/carrinho/remover', carrinhoController.removerItem.bind(carrinhoController));

  // Pagamento
  apiV1Router.post('/pagamento/gerar-qrcode', pagamentoController.gerarQrCode.bind(pagamentoController));
  apiV1Router.post('/pagamento/confirmar', pagamentoController.confirmarPagamento.bind(pagamentoController)); // Webhook simulation
  apiV1Router.post('/pagamento/registrar-pedido', pagamentoController.registrarPedido.bind(pagamentoController));
  apiV1Router.get('/pagamento/verificar-timer/:id_pagamento', pagamentoController.verificarTimer.bind(pagamentoController));

  // Pedido (Placeholder routes - implement fully when OrderController is ready)
  // apiV1Router.get('/pedidos/pendentes', orderController.listarPendentes.bind(orderController));
  // apiV1Router.put('/pedidos/iniciar-preparo/:id_pedido', orderController.iniciarPreparo.bind(orderController));
  // apiV1Router.put('/pedidos/atualizar-status/:id_pedido', orderController.atualizarStatus.bind(orderController));
  // apiV1Router.put('/pedidos/concluir-preparo/:id_pedido', orderController.concluirPreparo.bind(orderController));
  // apiV1Router.get('/pedidos/status/:id_pedido', orderController.verificarStatus.bind(orderController));

  // Mount the /api/v1 sub-router
  router.use('/api/v1', apiV1Router);
  // --- Fim Novas Rotas API V1 ---


  // --- Rotas Legadas (Manter ou remover/refatorar conforme necessidade) ---
  // Category routes
  router.get('/categories', categoryController.getAllCategories.bind(categoryController));
  router.get('/categories/:id', categoryController.getCategoryById.bind(categoryController));
  router.post('/categories', categoryController.createCategory.bind(categoryController));
  router.put('/categories/:id', categoryController.updateCategory.bind(categoryController));
  router.delete('/categories/:id', categoryController.deleteCategory.bind(categoryController));

  // Product routes
  router.get('/products', productController.getAllProducts.bind(productController));
  router.get('/products/:id', productController.getProductById.bind(productController));
  router.get('/products/category/:categoryId', productController.getProductsByCategory.bind(productController));
  router.post('/products', productController.createProduct.bind(productController));
  router.put('/products/:id', productController.updateProduct.bind(productController));
  router.delete('/products/:id', productController.deleteProduct.bind(productController));
  // --- Fim Rotas Legadas ---

  return router;
}

