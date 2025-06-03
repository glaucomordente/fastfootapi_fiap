import { Request, Response } from 'express';
import { getDataSource } from '../../../../../lib/typeorm';
import { ProductEntity } from '../../out/persistence/entities/Product.entity';
import { CategoryEntity } from '../../../../categories/adapters/out/persistence/entities/Category.entity';
import { ProductUseCase } from '../../../domain/ports/in/ProductUseCase';

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       required:
 *         - name
 *         - price
 *         - categoryId
 *       properties:
 *         id:
 *           type: integer
 *           description: The product ID
 *         name:
 *           type: string
 *           description: The product name
 *         description:
 *           type: string
 *           description: The product description
 *         price:
 *           type: number
 *           format: float
 *           description: The product price
 *         imageUrl:
 *           type: string
 *           description: URL to the product image
 *         categoryId:
 *           type: integer
 *           description: The ID of the category this product belongs to
 *         stock:
 *           type: integer
 *           description: The available stock quantity
 *       example:
 *         id: 1
 *         name: Cheeseburger
 *         description: Delicious burger with cheese
 *         price: 12.99
 *         imageUrl: https://example.com/cheeseburger.jpg
 *         categoryId: 1
 *         stock: 10
 */

/**
 * ProductController
 * 
 * This controller handles HTTP requests related to products.
 * It follows the hexagonal architecture pattern as an input adapter.
 */
export class ProductController {
  constructor(private productUseCase?: ProductUseCase) {}

  /**
   * @swagger
   * /products:
   *   get:
   *     summary: Returns all products
   *     tags: [Products]
   *     responses:
   *       200:
   *         description: The list of products
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/Product'
   *       500:
   *         description: Internal server error
   */
  async getAllProducts(req: Request, res: Response): Promise<Response> {
    try {
      const dataSource = await getDataSource();
      const productRepository = dataSource.getRepository(ProductEntity);
      const products = await productRepository.find({
        relations: ['category']
      });
      return res.status(200).json(products);
    } catch (error) {
      console.error('Error fetching products:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * @swagger
   * /products/{id}:
   *   get:
   *     summary: Get a product by id
   *     tags: [Products]
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: integer
   *         required: true
   *         description: The product id
   *     responses:
   *       200:
   *         description: The product
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Product'
   *       404:
   *         description: Product not found
   *       500:
   *         description: Internal server error
   */
  async getProductById(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const dataSource = await getDataSource();
      const productRepository = dataSource.getRepository(ProductEntity);
      const product = await productRepository.findOne({
        where: { id: Number(id) },
        relations: ['category']
      });
      
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }
      
      return res.status(200).json(product);
    } catch (error) {
      console.error('Error fetching product:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * @swagger
   * /products/category/{categoryId}:
   *   get:
   *     summary: Get products by category
   *     tags: [Products]
   *     parameters:
   *       - in: path
   *         name: categoryId
   *         schema:
   *           type: integer
   *         required: true
   *         description: The category id
   *     responses:
   *       200:
   *         description: The list of products in the category
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/Product'
   *       500:
   *         description: Internal server error
   */
  async getProductsByCategory(req: Request, res: Response): Promise<Response> {
    try {
      const { categoryId } = req.params;
      const dataSource = await getDataSource();
      const productRepository = dataSource.getRepository(ProductEntity);
      const products = await productRepository.find({
        where: { categoryId: Number(categoryId) },
        relations: ['category']
      });
      
      return res.status(200).json(products);
    } catch (error) {
      console.error('Error fetching products by category:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * @swagger
   * /products:
   *   post:
   *     summary: Create a new product
   *     tags: [Products]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - name
   *               - price
   *               - categoryId
   *             properties:
   *               name:
   *                 type: string
   *                 description: The product name
   *               description:
   *                 type: string
   *                 description: The product description
   *               price:
   *                 type: number
   *                 format: float
   *                 description: The product price
   *               imageUrl:
   *                 type: string
   *                 description: URL to the product image
   *               categoryId:
   *                 type: integer
   *                 description: The ID of the category this product belongs to
   *               stock:
   *                 type: integer
   *                 description: The available stock quantity
   *     responses:
   *       201:
   *         description: The created product
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Product'
   *       400:
   *         description: Bad request - missing required fields
   *       404:
   *         description: Category not found
   *       500:
   *         description: Internal server error
   */
  async createProduct(req: Request, res: Response): Promise<Response> {
    try {
      const { name, description, price, imageUrl, categoryId, stock } = req.body;
      
      if (!name || !price || !categoryId) {
        return res.status(400).json({ error: 'Name, price, and categoryId are required' });
      }
      
      const dataSource = await getDataSource();
      
      // Check if category exists
      const categoryRepository = dataSource.getRepository(CategoryEntity);
      const category = await categoryRepository.findOne({
        where: { id: Number(categoryId) }
      });
      
      if (!category) {
        return res.status(404).json({ error: `Category with ID ${categoryId} not found` });
      }
      
      const productRepository = dataSource.getRepository(ProductEntity);
      
      const newProduct = productRepository.create({
        name,
        description,
        price: parseFloat(price),
        imageUrl,
        categoryId: Number(categoryId),
        stock: stock ? Number(stock) : 0
        // createdAt and updatedAt will be automatically set by TypeORM
      });
      
      const savedProduct = await productRepository.save(newProduct);
      return res.status(201).json(savedProduct);
    } catch (error) {
      console.error('Error creating product:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * @swagger
   * /products/{id}:
   *   put:
   *     summary: Update a product
   *     tags: [Products]
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: integer
   *         required: true
   *         description: The product id
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               name:
   *                 type: string
   *                 description: The product name
   *               description:
   *                 type: string
   *                 description: The product description
   *               price:
   *                 type: number
   *                 format: float
   *                 description: The product price
   *               imageUrl:
   *                 type: string
   *                 description: URL to the product image
   *               categoryId:
   *                 type: integer
   *                 description: The ID of the category this product belongs to
   *               stock:
   *                 type: integer
   *                 description: The available stock quantity
   *     responses:
   *       200:
   *         description: The updated product
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Product'
   *       404:
   *         description: Product not found or Category not found
   *       500:
   *         description: Internal server error
   */
  async updateProduct(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const { name, description, price, imageUrl, categoryId, stock } = req.body;
      
      const dataSource = await getDataSource();
      const productRepository = dataSource.getRepository(ProductEntity);
      
      const existingProduct = await productRepository.findOne({
        where: { id: Number(id) }
      });
      
      if (!existingProduct) {
        return res.status(404).json({ error: 'Product not found' });
      }
      
      // Check if category exists if it's being updated
      if (categoryId !== undefined) {
        const categoryRepository = dataSource.getRepository(CategoryEntity);
        const category = await categoryRepository.findOne({
          where: { id: Number(categoryId) }
        });
        
        if (!category) {
          return res.status(404).json({ error: `Category with ID ${categoryId} not found` });
        }
      }
      
      // Update fields
      if (name !== undefined) existingProduct.name = name;
      if (description !== undefined) existingProduct.description = description;
      if (price !== undefined) existingProduct.price = parseFloat(price);
      if (imageUrl !== undefined) existingProduct.imageUrl = imageUrl;
      if (categoryId !== undefined) existingProduct.categoryId = Number(categoryId);
      if (stock !== undefined) existingProduct.stock = Number(stock);
      // updatedAt will be automatically updated by TypeORM
      
      const updatedProduct = await productRepository.save(existingProduct);
      return res.status(200).json(updatedProduct);
    } catch (error) {
      console.error('Error updating product:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * @swagger
   * /products/{id}:
   *   delete:
   *     summary: Delete a product
   *     tags: [Products]
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: integer
   *         required: true
   *         description: The product id
   *     responses:
   *       204:
   *         description: Product deleted successfully
   *       404:
   *         description: Product not found
   *       500:
   *         description: Internal server error
   */
  async deleteProduct(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      
      const dataSource = await getDataSource();
      const productRepository = dataSource.getRepository(ProductEntity);
      
      const existingProduct = await productRepository.findOne({
        where: { id: Number(id) }
      });
      
      if (!existingProduct) {
        return res.status(404).json({ error: 'Product not found' });
      }
      
      await productRepository.remove(existingProduct);
      return res.status(204).send();
    } catch (error) {
      console.error('Error deleting product:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}
