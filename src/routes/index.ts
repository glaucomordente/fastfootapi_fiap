import { Router, Request, Response } from 'express';
import { CategoryModule } from '../modules/categories/CategoryModule';
import { ProductModule } from '../modules/products/ProductModule';
import { CustomerModule } from '../modules/customer/CustomerModule';
import { CarrinhoModule } from '../modules/carrinho/CarrinhoModule';

/**
 * Setup routes with initialized modules
 * @param categoryModule Initialized CategoryModule
 * @param productModule Initialized ProductModule
 * @param customerModule Initialized CustomerModule
 * @returns Express router
 */
export default function setupRoutes(
  categoryModule: CategoryModule,
  productModule: ProductModule,
  customerModule: CustomerModule
): Router {
  const router = Router();
  
  // Get controllers from initialized modules
  const categoryController = categoryModule.getController();
  const productController = productModule.getController();
  const customerController = customerModule.getController();
  const carrinhoController = new CarrinhoModule().getController();

  // Health check route
  router.get('/health', (req: Request, res: Response) => {
    res.status(200).json({ status: 'OK' });
  });

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

  // Customer routes
  router.get('/customers', customerController.getAllCustomers.bind(customerController));
  router.get('/customers/:id', customerController.getCustomerById.bind(customerController));
  router.post('/customers', customerController.createCustomer.bind(customerController));
  router.put('/customers/:id', customerController.updateCustomer.bind(customerController));
  router.delete('/customers/:id', customerController.deleteCustomer.bind(customerController));

  // Carrinho routes
  router.post('/v1/carrinho/adicionar/lanche', carrinhoController.adicionarLanche.bind(carrinhoController));
  router.get('/v1/carrinho/visualizar', carrinhoController.visualizarCarrinho.bind(carrinhoController));
  router.delete('/v1/carrinho/remover', carrinhoController.removerItem.bind(carrinhoController));
  router.post('/v1/carrinho/confirmar', carrinhoController.confirmarCarrinho.bind(carrinhoController));

  return router;
}
