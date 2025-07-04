import { Request, Response } from "express";
import { getDataSource } from "../../../../../lib/typeorm";
import { CategoryEntity } from "../../out/persistence/entities/Category.entity";

/**
 * CategoryController
 *
 * This controller serves as an input adapter for the web interface.
 * It translates HTTP requests into calls to the CategoryUseCase (input port).
 */
export class CategoryController {
  /**
   * Get all categories
   */
  getAllCategories = async (req: Request, res: Response) => {
    try {
      const dataSource = await getDataSource();
      const categoryRepository = dataSource.getRepository(CategoryEntity);
      const categories = await categoryRepository.find();
      return res.status(200).json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  };

  /**
   * Get a category by ID
   */
  getCategoryById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const dataSource = await getDataSource();
      const categoryRepository = dataSource.getRepository(CategoryEntity);
      const category = await categoryRepository.findOne({
        where: { id: Number(id) },
        relations: ["products"],
      });

      if (!category) {
        return res.status(404).json({ error: "Category not found" });
      }

      return res.status(200).json(category);
    } catch (error) {
      console.error("Error fetching category:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  };

  /**
   * Create a new category
   */
  createCategory = async (req: Request, res: Response) => {
    try {
      const { name, description } = req.body;

      if (!name) {
        return res.status(400).json({ error: "Name is required" });
      }

      const dataSource = await getDataSource();
      const categoryRepository = dataSource.getRepository(CategoryEntity);

      const newCategory = categoryRepository.create({
        name,
        description,
      });

      const savedCategory = await categoryRepository.save(newCategory);
      return res.status(201).json(savedCategory);
    } catch (error) {
      console.error("Error creating category:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  };

  /**
   * Update an existing category
   */
  updateCategory = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { name, description } = req.body;

      const dataSource = await getDataSource();
      const categoryRepository = dataSource.getRepository(CategoryEntity);

      const existingCategory = await categoryRepository.findOne({
        where: { id: Number(id) },
      });

      if (!existingCategory) {
        return res.status(404).json({ error: "Category not found" });
      }

      // Update fields
      if (name !== undefined) existingCategory.name = name;
      if (description !== undefined) existingCategory.description = description;

      const updatedCategory = await categoryRepository.save(existingCategory);
      return res.status(200).json(updatedCategory);
    } catch (error) {
      console.error("Error updating category:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  };

  /**
   * Delete a category
   */
  deleteCategory = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const dataSource = await getDataSource();
      const categoryRepository = dataSource.getRepository(CategoryEntity);

      const existingCategory = await categoryRepository.findOne({
        where: { id: Number(id) },
      });

      if (!existingCategory) {
        return res.status(404).json({ error: "Category not found" });
      }

      await categoryRepository.remove(existingCategory);
      return res.status(204).send();
    } catch (error) {
      console.error("Error deleting category:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  };
}
