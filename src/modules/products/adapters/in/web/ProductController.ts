import { Request, Response } from "express";
import { getDataSource } from "../../../../../lib/typeorm";
import { ProductEntity } from "../../out/persistence/entities/Product.entity";
import { CategoryEntity } from "../../../../categories/adapters/out/persistence/entities/Category.entity";

/**
 * ProductController
 *
 * This controller serves as an input adapter for the web interface.
 * It translates HTTP requests into calls to the ProductUseCase (input port).
 */
export class ProductController {
  /**
   * Get all products
   */
  getAllProducts = async (req: Request, res: Response) => {
    try {
      const dataSource = await getDataSource();
      const productRepository = dataSource.getRepository(ProductEntity);
      const products = await productRepository.find({
        relations: ["category"],
      });
      return res.status(200).json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  };

  /**
   * Get a product by ID
   */
  getProductById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const dataSource = await getDataSource();
      const productRepository = dataSource.getRepository(ProductEntity);
      const product = await productRepository.findOne({
        where: { id: Number(id) },
        relations: ["category"],
      });

      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }

      return res.status(200).json(product);
    } catch (error) {
      console.error("Error fetching product:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  };

  /**
   * Get products by category
   */
  getProductsByCategory = async (req: Request, res: Response) => {
    try {
      const { categoryId } = req.params;
      const dataSource = await getDataSource();
      const productRepository = dataSource.getRepository(ProductEntity);
      const products = await productRepository.find({
        where: { categoryId: Number(categoryId) },
        relations: ["category"],
      });

      return res.status(200).json(products);
    } catch (error) {
      console.error("Error fetching products by category:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  };

  /**
   * Create a new product
   */
  createProduct = async (req: Request, res: Response) => {
    try {
      const { name, description, price, imageUrl, categoryId, stock } =
        req.body;

      if (!name || !price || !categoryId) {
        return res
          .status(400)
          .json({ error: "Name, price, and categoryId are required" });
      }

      const dataSource = await getDataSource();

      // Check if category exists
      const categoryRepository = dataSource.getRepository(CategoryEntity);
      const category = await categoryRepository.findOne({
        where: { id: Number(categoryId) },
      });

      if (!category) {
        return res
          .status(404)
          .json({ error: `Category with ID ${categoryId} not found` });
      }

      const productRepository = dataSource.getRepository(ProductEntity);

      const newProduct = productRepository.create({
        name,
        description,
        price: parseFloat(price),
        imageUrl,
        categoryId: Number(categoryId),
        stock: stock ? Number(stock) : 0,
      });

      const savedProduct = await productRepository.save(newProduct);
      return res.status(201).json(savedProduct);
    } catch (error) {
      console.error("Error creating product:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  };

  /**
   * Update an existing product
   */
  updateProduct = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { name, description, price, imageUrl, categoryId, stock } =
        req.body;

      const dataSource = await getDataSource();
      const productRepository = dataSource.getRepository(ProductEntity);

      const existingProduct = await productRepository.findOne({
        where: { id: Number(id) },
      });

      if (!existingProduct) {
        return res.status(404).json({ error: "Product not found" });
      }

      // Check if category exists if it's being updated
      if (categoryId !== undefined) {
        const categoryRepository = dataSource.getRepository(CategoryEntity);
        const category = await categoryRepository.findOne({
          where: { id: Number(categoryId) },
        });

        if (!category) {
          return res
            .status(404)
            .json({ error: `Category with ID ${categoryId} not found` });
        }
      }

      // Update fields
      if (name !== undefined) existingProduct.name = name;
      if (description !== undefined) existingProduct.description = description;
      if (price !== undefined) existingProduct.price = parseFloat(price);
      if (imageUrl !== undefined) existingProduct.imageUrl = imageUrl;
      if (categoryId !== undefined)
        existingProduct.categoryId = Number(categoryId);
      if (stock !== undefined) existingProduct.stock = Number(stock);

      const updatedProduct = await productRepository.save(existingProduct);
      return res.status(200).json(updatedProduct);
    } catch (error) {
      console.error("Error updating product:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  };

  /**
   * Delete a product
   */
  deleteProduct = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const dataSource = await getDataSource();
      const productRepository = dataSource.getRepository(ProductEntity);

      const existingProduct = await productRepository.findOne({
        where: { id: Number(id) },
      });

      if (!existingProduct) {
        return res.status(404).json({ error: "Product not found" });
      }

      await productRepository.remove(existingProduct);
      return res.status(204).send();
    } catch (error) {
      console.error("Error deleting product:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  };
}
