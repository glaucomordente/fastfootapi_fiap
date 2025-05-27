import { Request, Response } from 'express';
import { ProductUseCase } from '../../../domain/ports/in/ProductUseCase';

/**
 * ProductController
 *
 * Adapts HTTP requests for Product operations.
 */
export class ProductController {

  // Store the service instance passed from the module
  constructor(private productUseCase: ProductUseCase) {}

  /**
   * GET /api/v1/produtos/listar
   * Lists products, optionally filtered by category.
   */
  listarProdutos = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id_sessao, categoria } = req.query;
      // TODO: Validate id_sessao if necessary

      const resultado = await this.productUseCase.listarProdutos(categoria as string | undefined);
      res.status(200).json(resultado);
    } catch (error) {
      console.error('Erro ao listar produtos:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  };

  // --- Legacy Route Handlers (adjust or remove based on final routing strategy) ---

  /**
   * GET /products
   * (Legacy) Get all products - adjust based on ProductService method
   */
  getAllProducts = async (req: Request, res: Response): Promise<void> => {
    try {
      // Assuming ProductService has a method returning domain entities for legacy routes
      const products = await (this.productUseCase as any).getAllProductsLegacy(); // Cast or check type
      // Map domain entities to a suitable DTO if needed for the legacy response
      res.status(200).json(products.map(p => ({ // Example mapping
          id: p.id,
          name: p.name,
          description: p.description,
          price: p.price,
          imageUrl: p.imageUrl,
          categoryId: p.categoryId,
          stock: p.stock,
          createdAt: p.createdAt,
          updatedAt: p.updatedAt
      })));
    } catch (error) {
      console.error('Error fetching legacy products:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  /**
   * GET /products/:id
   * (Legacy) Get a product by ID - adjust based on ProductService method
   */
  getProductById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      // Use the internal getProductById which returns the domain entity
      const product = await this.productUseCase.getProductById(id); // ID is now string (UUID)

      if (!product) {
        res.status(404).json({ error: 'Product not found' });
        return;
      }
      // Map domain entity to a suitable DTO if needed for the legacy response
      res.status(200).json({ // Example mapping
          id: product.id,
          name: product.name,
          description: product.description,
          price: product.price,
          imageUrl: product.imageUrl,
          categoryId: product.categoryId,
          stock: product.stock,
          createdAt: product.createdAt,
          updatedAt: product.updatedAt
      });
    } catch (error) {
      console.error('Error fetching legacy product by ID:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  /**
   * GET /products/category/:categoryId
   * (Legacy) Get products by category ID - adjust based on ProductService method
   */
  getProductsByCategory = async (req: Request, res: Response): Promise<void> => {
    try {
      const { categoryId } = req.params;
      // Assuming ProductService has a method returning domain entities for legacy routes
      const products = await (this.productUseCase as any).getProductsByCategoryLegacy(Number(categoryId)); // Cast or check type
      // Map domain entities to a suitable DTO if needed for the legacy response
      res.status(200).json(products.map(p => ({ // Example mapping
          id: p.id,
          name: p.name,
          description: p.description,
          price: p.price,
          imageUrl: p.imageUrl,
          categoryId: p.categoryId,
          stock: p.stock,
          createdAt: p.createdAt,
          updatedAt: p.updatedAt
      })));
    } catch (error) {
      console.error('Error fetching legacy products by category:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  /**
   * POST /products
   * (Legacy) Create a new product - adjust based on ProductService method
   */
  createProduct = async (req: Request, res: Response): Promise<void> => {
    try {
      const { name, description, price, imageUrl, categoryId, stock, disponivel, destaque } = req.body;

      if (!name || price === undefined || categoryId === undefined) {
        res.status(400).json({ error: 'Name, price, and categoryId are required' });
        return;
      }

      const productData = {
        name,
        description,
        price: parseFloat(price),
        imageUrl,
        categoryId: Number(categoryId),
        stock: stock !== undefined ? Number(stock) : 0,
        disponivel: disponivel !== undefined ? Boolean(disponivel) : true,
        destaque: destaque !== undefined ? Boolean(destaque) : false,
      };

      const newProduct = await this.productUseCase.createProduct(productData);

      // Map domain entity to a suitable DTO if needed for the legacy response
      res.status(201).json({ // Example mapping
          id: newProduct.id,
          name: newProduct.name,
          description: newProduct.description,
          price: newProduct.price,
          imageUrl: newProduct.imageUrl,
          categoryId: newProduct.categoryId,
          stock: newProduct.stock,
          createdAt: newProduct.createdAt,
          updatedAt: newProduct.updatedAt
      });
    } catch (error) {
      console.error('Error creating legacy product:', error);
      if (error instanceof Error && error.message.includes('Categoria com ID')) {
          res.status(400).json({ error: error.message });
      } else {
          res.status(500).json({ error: 'Internal server error' });
      }
    }
  };

  /**
   * PUT /products/:id
   * (Legacy) Update an existing product - adjust based on ProductService method
   */
  updateProduct = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Map legacy body to ProductUpdatePayload if necessary
      const productUpdatePayload = {
          name: updateData.name,
          description: updateData.description,
          price: updateData.price !== undefined ? parseFloat(updateData.price) : undefined,
          imageUrl: updateData.imageUrl,
          categoryId: updateData.categoryId !== undefined ? Number(updateData.categoryId) : undefined,
          stock: updateData.stock !== undefined ? Number(updateData.stock) : undefined,
          disponivel: updateData.disponivel !== undefined ? Boolean(updateData.disponivel) : undefined,
          destaque: updateData.destaque !== undefined ? Boolean(updateData.destaque) : undefined,
      };

      const updatedProduct = await this.productUseCase.updateProduct(id, productUpdatePayload);

      if (!updatedProduct) {
        res.status(404).json({ error: 'Product not found' });
        return;
      }

      // Map domain entity to a suitable DTO if needed for the legacy response
      res.status(200).json({ // Example mapping
          id: updatedProduct.id,
          name: updatedProduct.name,
          description: updatedProduct.description,
          price: updatedProduct.price,
          imageUrl: updatedProduct.imageUrl,
          categoryId: updatedProduct.categoryId,
          stock: updatedProduct.stock,
          createdAt: updatedProduct.createdAt,
          updatedAt: updatedProduct.updatedAt
      });
    } catch (error) {
      console.error('Error updating legacy product:', error);
       if (error instanceof Error && error.message.includes('Categoria com ID')) {
          res.status(400).json({ error: error.message });
      } else {
          res.status(500).json({ error: 'Internal server error' });
      }
    }
  };

  /**
   * DELETE /products/:id
   * (Legacy) Delete a product - adjust based on ProductService method
   */
  deleteProduct = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const deleted = await this.productUseCase.deleteProduct(id);

      if (!deleted) {
        res.status(404).json({ error: 'Product not found' });
        return;
      }

      res.status(204).send();
    } catch (error) {
      console.error('Error deleting legacy product:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
}

