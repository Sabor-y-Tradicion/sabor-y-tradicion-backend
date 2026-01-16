import { Request, Response, NextFunction } from 'express';
import categoryService from '../services/category.service';
import { createCategorySchema, updateCategorySchema } from '../validators/category.validator';
import { successResponse, errorResponse } from '../utils/response';

export class CategoryController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenant?.id;
      const categories = await categoryService.getAll(tenantId);
      return res.json(successResponse(categories));
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const tenantId = req.tenant?.id;
      const category = await categoryService.getById(id, tenantId);
      return res.json(successResponse(category));
    } catch (error: any) {
      if (error.message === 'Category not found') {
        return res.status(404).json(errorResponse(error.message));
      }
      next(error);
    }
  }

  async getBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const { slug } = req.params;
      const tenantId = req.tenant?.id;

      if (!tenantId) {
        return res.status(400).json(errorResponse('Tenant ID is required'));
      }

      const category = await categoryService.getBySlug(slug, tenantId);
      return res.json(successResponse(category));
    } catch (error: any) {
      if (error.message === 'Category not found') {
        return res.status(404).json(errorResponse(error.message));
      }
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenant?.id;

      if (!tenantId) {
        return res.status(400).json(errorResponse('Tenant ID is required'));
      }

      const validatedData = createCategorySchema.parse(req.body);
      const category = await categoryService.create(validatedData, tenantId);
      return res.status(201).json(successResponse(category, 'Category created successfully'));
    } catch (error: any) {
      if (error.message === 'Category with this name already exists') {
        return res.status(409).json(errorResponse(error.message));
      }
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const tenantId = req.tenant?.id;
      const validatedData = updateCategorySchema.parse(req.body);
      const category = await categoryService.update(id, validatedData, tenantId);
      return res.json(successResponse(category, 'Category updated successfully'));
    } catch (error: any) {
      if (error.message === 'Category not found') {
        return res.status(404).json(errorResponse(error.message));
      }
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const tenantId = req.tenant?.id;
      const result = await categoryService.delete(id, tenantId);
      return res.json(successResponse(result, 'Category deleted successfully'));
    } catch (error: any) {
      if (error.message === 'Category not found') {
        return res.status(404).json(errorResponse(error.message));
      }
      if (error.message === 'Cannot delete category with associated dishes') {
        return res.status(400).json(errorResponse(error.message));
      }
      next(error);
    }
  }

  async reorder(req: Request, res: Response, next: NextFunction) {
    try {
      const { categoryIds } = req.body;

      if (!Array.isArray(categoryIds)) {
        return res.status(400).json(errorResponse('categoryIds must be an array'));
      }

      const result = await categoryService.reorder(categoryIds);
      return res.json(successResponse(result, 'Categories reordered successfully'));
    } catch (error) {
      next(error);
    }
  }
}

export default new CategoryController();

