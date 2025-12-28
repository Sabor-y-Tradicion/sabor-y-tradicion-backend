import { Request, Response, NextFunction } from 'express';
import categoryService from '../services/category.service';
import { createCategorySchema, updateCategorySchema } from '../validators/category.validator';
import { successResponse, errorResponse } from '../utils/response';

export class CategoryController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await categoryService.getAll();
      return successResponse(res, categories);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const category = await categoryService.getById(id);
      return successResponse(res, category);
    } catch (error: any) {
      if (error.message === 'Category not found') {
        return errorResponse(res, error.message, 404);
      }
      next(error);
    }
  }

  async getBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const { slug } = req.params;
      const category = await categoryService.getBySlug(slug);
      return successResponse(res, category);
    } catch (error: any) {
      if (error.message === 'Category not found') {
        return errorResponse(res, error.message, 404);
      }
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = createCategorySchema.parse(req.body);
      const category = await categoryService.create(validatedData);
      return successResponse(res, category, 'Category created successfully', 201);
    } catch (error: any) {
      if (error.message === 'Category with this name already exists') {
        return errorResponse(res, error.message, 409);
      }
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const validatedData = updateCategorySchema.parse(req.body);
      const category = await categoryService.update(id, validatedData);
      return successResponse(res, category, 'Category updated successfully');
    } catch (error: any) {
      if (error.message === 'Category not found') {
        return errorResponse(res, error.message, 404);
      }
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await categoryService.delete(id);
      return successResponse(res, result, 'Category deleted successfully');
    } catch (error: any) {
      if (error.message === 'Category not found') {
        return errorResponse(res, error.message, 404);
      }
      if (error.message === 'Cannot delete category with associated dishes') {
        return errorResponse(res, error.message, 400);
      }
      next(error);
    }
  }

  async reorder(req: Request, res: Response, next: NextFunction) {
    try {
      const { categoryIds } = req.body;

      if (!Array.isArray(categoryIds)) {
        return errorResponse(res, 'categoryIds must be an array', 400);
      }

      const result = await categoryService.reorder(categoryIds);
      return successResponse(res, result, 'Categories reordered successfully');
    } catch (error) {
      next(error);
    }
  }
}

export default new CategoryController();

