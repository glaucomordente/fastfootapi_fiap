import { Request, Response } from 'express';
import { CategoryUseCase } from '../../../domain/ports/in/CategoryUseCase';
import { Category, CategoryDTO } from '../../../domain/entities/Category';

/**
 * @swagger
 * components:
 *   schemas:
 *     Category:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         id:
 *           type: integer
 *           description: The category ID
 *         name:
 *           type: string
 *           description: The category name
 *         description:
 *           type: string
 *           description: The category description
 *       example:
 *         id: 1
 *         name: Burgers
 *         description: Delicious hamburgers
 */

/**
 * CategoryController
 * 
 * This controller handles HTTP requests related to categories.
 * It follows the hexagonal architecture pattern as an input adapter.
 */
export class CategoryController {
  constructor(private categoryUseCase: CategoryUseCase) {}

  /**
   * @swagger
   * /categories:
   *   get:
   *     summary: Returns all categories
   *     tags: [Categories]
   *     responses:
   *       200:
   *         description: The list of categories
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/Category'
   *       500:
   *         description: Internal server error
   */
  async getAllCategories(req: Request, res: Response): Promise<Response> {
    try {
      const categories = await this.categoryUseCase.findAll();
      return res.status(200).json(categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * @swagger
   * /categories/{id}:
   *   get:
   *     summary: Get a category by id
   *     tags: [Categories]
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: integer
   *         required: true
   *         description: The category id
   *     responses:
   *       200:
   *         description: The category
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Category'
   *       404:
   *         description: Category not found
   *       500:
   *         description: Internal server error
   */
  async getCategoryById(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const category = await this.categoryUseCase.findById(Number(id));

      if (!category) {
        return res.status(404).json({ error: 'Category not found' });
      }

      return res.status(200).json(category);
    } catch (error) {
      console.error('Error fetching category:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * @swagger
   * /categories:
   *   post:
   *     summary: Create a new category
   *     tags: [Categories]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - name
   *             properties:
   *               name:
   *                 type: string
   *                 description: The category name
   *               description:
   *                 type: string
   *                 description: The category description
   *     responses:
   *       201:
   *         description: The created category
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Category'
   *       400:
   *         description: Bad request - missing required fields
   *       500:
   *         description: Internal server error
   */
  async createCategory(req: Request, res: Response): Promise<Response> {
    try {
      const { name, description } = req.body;

      if (!name) {
        return res.status(400).json({ error: 'Name is required' });
      }

      const categoryData: CategoryDTO = {
        id: null, // Will be assigned by the database
        name,
        description: description || null
      };

      const newCategory = Category.fromDTO(categoryData);
      const savedCategory = await this.categoryUseCase.save(newCategory);
      return res.status(201).json(savedCategory);
    } catch (error) {
      console.error('Error creating category:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * @swagger
   * /categories/{id}:
   *   put:
   *     summary: Update a category
   *     tags: [Categories]
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: integer
   *         required: true
   *         description: The category id
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               name:
   *                 type: string
   *                 description: The category name
   *               description:
   *                 type: string
   *                 description: The category description
   *     responses:
   *       200:
   *         description: The updated category
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Category'
   *       404:
   *         description: Category not found
   *       500:
   *         description: Internal server error
   */
  async updateCategory(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const { name, description } = req.body;

      const existingCategory = await this.categoryUseCase.findById(Number(id));
      if (!existingCategory) {
        return res.status(404).json({ error: 'Category not found' });
      }

      // Update the category fields
      if (name !== undefined) {
        existingCategory.updateName(name);
      }
      if (description !== undefined) {
        existingCategory.updateDescription(description);
      }

      const savedCategory = await this.categoryUseCase.save(existingCategory);
      return res.status(200).json(savedCategory);
    } catch (error) {
      console.error('Error updating category:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * @swagger
   * /categories/{id}:
   *   delete:
   *     summary: Delete a category
   *     tags: [Categories]
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: integer
   *         required: true
   *         description: The category id
   *     responses:
   *       204:
   *         description: Category deleted successfully
   *       404:
   *         description: Category not found
   *       500:
   *         description: Internal server error
   */
  async deleteCategory(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const existingCategory = await this.categoryUseCase.findById(Number(id));

      if (!existingCategory) {
        return res.status(404).json({ error: 'Category not found' });
      }

      await this.categoryUseCase.delete(Number(id));
      return res.status(204).send();
    } catch (error) {
      console.error('Error deleting category:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}
